const express = require('express');
const morgan = require('morgan');
const os = require('os');
const path = require('path');
const pug = require('pug');
const crypto = require('crypto');
const url = require('url');

const redisService = require('./redis.js');

const animals = require('./animals.json');

const app = express();
app.use(morgan(':method :url :status :response-time ms'));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const server = app.listen(parseInt(process.env.PORT || 3000, 10));

const roomCodesByClientId = {};

const generateRandomString = length => {
  const alphabet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  const alphabetLength = alphabet.length;

  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
  }

  return randomString;
}

const ROOM_CODE_LENGTH = 6;
const generateRoomCode = async () => {
  const roomCode = generateRandomString(ROOM_CODE_LENGTH);

  const room = await redisService.json.get(`room:${roomCode}`, '.');
  console.log("found", room);
  if (!room) {
    return roomCode;
  }

  return generateRoomCode();
};

const CLIENT_ID_SIZE = 50;
const generateClientId = () => {
  return crypto.randomBytes(CLIENT_ID_SIZE).toString('hex');
};

const getAnonymousName = (existingNames) => {
  const availableNames = animals.filter(animal => !existingNames[`Anonymous ${animal}`]);

  if (availableNames.length === 0) return generateClientId();
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  return `Anonymous ${name}`;
};

// TODO: Move Socket.Io to a separate file

const io = require('socket.io')(server);

io.engine.generateId = req => {
  const parsedUrl = new URL(req.url, 'https://example.com/'); // URL constructor requires baseUrl as second param
  const prevId = parsedUrl.searchParams.get('clientId')

  if (prevId && prevId !== 'null') {
    console.log("Client reconnecting", prevId);
    return prevId
  }
  return generateClientId();
}

io.on('connection', socket => {
  const clientId = socket.client.id;
  console.log("Client connected!", clientId);

  const rejoinAll = async () => {
    const roomCodes = await redisService.client.smembers(`clientrooms:${clientId}`);
    console.log("rejoining", roomCodes);
    if (roomCodes) roomCodes.forEach(roomId => socket.join(roomId));
  };

  // Have user rejoin any rooms they were previously in
  rejoinAll();

  socket.on('join', async (roomCode, name) => {
    console.log("Request to join room: ", roomCode);

    const rkey = `room:${roomCode}`;
    await redisService.redlock.using(['lock-' + rkey], 1000, async (signal) => {
      console.log('locked');
      const room = await redisService.json.get(rkey, '.');
      console.log(room);
      if (!room) return;

      socket.join(roomCode);

      await redisService.client.sadd(`clientrooms:${clientId}`, roomCode);

      const existingMember = room.members.find(member => member.ioClientId === clientId);

      if (!existingMember) {
        room.members.push({
          ioClientId: clientId,
          nonce: generateClientId(),
          ready: false,
          votes: [],
          name: room.isAnonymous ? getAnonymousName(room.members.map(member => member.name)) : name,
        });
        await redisService.json.set(rkey, '.', room);
      }
    });

    io.to(roomCode).emit('room-update', roomCode);
  });

  const eventWrapper = async (roomCode, cb) => {
    const rkey = `room:${roomCode}`;

    try {
      await redisService.redlock.using(['lock-' + rkey], 1000, async (signal) => {
        const room = await redisService.json.get(rkey, '.');
        if (!room) return;

        const member = room.members.find(member => member.ioClientId === clientId);
        if (!member) return;

        await cb({
          rkey,
          room,
          member,
          signal,
        });

        await redisService.json.set(rkey, '.', room);
      });

      io.to(roomCode).emit('room-update', roomCode);
    } catch(e) {
      console.error(e);
    }
  };

  socket.on('ready', (roomCode) => eventWrapper(roomCode, ({ room, member }) => {
    member.ready = !member.ready;
  }));

  socket.on('setState', (roomCode, state) => eventWrapper(roomCode, ({ room, member }) => {
    const validStates = ['preReview', 'brainstorm', 'group', 'vote', 'discuss', 'review'];

    if (!validStates.includes(state)) return;

    room.state = state;

    room.members.forEach((member) => member.ready = false);
    if (state !== 'vote' && state !== 'discuss') room.members.forEach((member) => member.votes = []);

    const actionItems = room.groups.map((group) => group.actionItems).flat();
    room.actionItems = [...actionItems, ...room.previousActionItems];
    room.currentGroupIdx = 0;
  }));

  socket.on('add', (roomCode, columnIdx, text) => eventWrapper(roomCode, ({ room, member }) => {
    const card = {
      text,
      columnIdx,
      nonce: generateClientId(),
      author: member.ioClientId,
      authorName: member.name,
    };
    const group = {
      title: '',
      columnIdx,
      nonce: generateClientId(),
      cards: [card],
      actionItems: [],
    };
    room.groups.push(group);
    room.nonceOrder.push(group.nonce);
    room.nonceOrder.push(card.nonce);
  }));

  socket.on('order', (roomCode, nonce, beforeNonce) => eventWrapper(roomCode, ({ room, member }) => {
    const nonceIdx = room.nonceOrder.indexOf(nonce);
    if (nonceIdx > -1) room.nonceOrder.splice(nonceIdx, 1);

    const beforeNonceIdx = room.nonceOrder.indexOf(beforeNonce);
    if (beforeNonceIdx > -1) room.nonceOrder.splice(beforeNonceIdx, 0, nonce);
    else room.nonceOrder.push(nonce);
  }));

  socket.on('groupCard', (roomCode, groupNonce, cardNonce, columnIdx) => eventWrapper(roomCode, ({ room, member }) => {
    for (let i = 0; i < room.groups.length; i++) {
      const group = room.groups[i];
      const cardIdx = group.cards.findIndex(card => card.nonce === cardNonce)
      if (cardIdx === -1) continue;

      const newGroup = room.groups.find(group => group.nonce === groupNonce);
      if (groupNonce && !newGroup) return;

      const card = group.cards.splice(cardIdx, 1)[0];
      if (room.state === 'brainstorm') card.columnIdx = columnIdx; // Only change card color when moving during brainstorm
      if (group.cards.length === 0) room.groups.splice(i, 1);
      if (group.cards.length === 1) group.title = '';

      if (newGroup) {
        newGroup.cards.push(card);
      } else {
        room.groups.push({
          title: '',
          columnIdx,
          nonce: generateClientId(),
          cards: [card],
          actionItems: [],
        });
      }

      return;
    }
  }));

  socket.on('vote', (roomCode, nonces) => eventWrapper(roomCode, ({ room, member }) => {
    if (member && nonces.length <= room.voteCount) {
      member.votes = nonces;
      member.ready = nonces.length === room.voteCount;
    }
  }));

  socket.on('card.delete', (roomCode, groupNonce, nonce) => eventWrapper(roomCode, ({ room, member }) => {
    const group = room.groups.find(group => group.nonce === groupNonce);
    if (!group) return;
    const card = group.cards.find(card => card.nonce === nonce);
    if (!card) return;

    if (card.author !== member?.ioClientId) return;

    group.cards.splice(group.cards.indexOf(card), 1);
    if (group.cards.length === 0) room.groups.splice(room.groups.indexOf(group), 1);
  }));

  socket.on('group.rename', (roomCode, nonce, title) => eventWrapper(roomCode, ({ room, member }) => {
    const group = room.groups.find(group => group.nonce === nonce);
    console.log("group is", group, title);
    if (!group) return;

    group.title = title;
  }));
  //socket.on('moveCard', (roomCode, nonce, columnIdx) => eventWrapper(roomCode, (room, member) => {
    //const group = room.groups.find((group) => group.cards.find((card) => card.nonce === nonce));
    //if (group.cards.length > 1) return; // Groups must be moved with moveGroup, or card must be moved out of group via groupCard

    //group.columnIdx = columnIdx;
    //group.cards[0].columnIdx = columnIdx;
  //}));

  socket.on('moveGroup', (roomCode, nonce, columnIdx) => eventWrapper(roomCode, ({ room, member }) => {
    const group = room.groups.find((group) => group.nonce === nonce);
    group.columnIdx = columnIdx;
    group.cards.forEach((card) => card.columnIdx = columnIdx);
  }));

  socket.on('actionItem.create', (roomCode, nonce, title) => eventWrapper(roomCode, ({ room, member }) => {
    const group = room.groups.find((group) => group.nonce === nonce);

    if (!group) return;

    const actionItem = {
      title,
      date: new Date().getTime(),
      nonce: generateClientId(),
      done: false,
    };
    group.actionItems.push(actionItem);
  }));

  socket.on('actionItem.update', (roomCode, nonce, title, done, del) => eventWrapper(roomCode, ({ room, member }) => {
    const update = (list) => {
      const actionItem = list.find((actionItem) => actionItem.nonce === nonce);
      if (actionItem) {
        actionItem.title = title;
        actionItem.done = done;

        if (del) list.splice(list.indexOf(actionItem), 1);
      }
    };

    room.groups.forEach((group) => {
      update(group.actionItems);
    });
 
    update(room.actionItems);
    update(room.previousActionItems);
  }));

  socket.on('setCurrentGroup', (roomCode, groupIdx) => eventWrapper(roomCode, ({ room, member }) => {
    if (groupIdx < 0 || groupIdx > room.groups.length - 1) return;

    room.currentGroupIdx = groupIdx;
  }));

  socket.on('timer.set', (roomCode, endStamp) => eventWrapper(roomCode, ({ room, member }) => {
    room.timerEnd = new Date(endStamp).getTime() || null;
  }));

  socket.on('timer.clear', (roomCode) => eventWrapper(roomCode, ({ room, member }) => {
    room.timerEnd = null;
  }));
  //socket.on('delete', (roomCode, nonce) => eventWrapper(roomCode, (room, member) => {
    //for (let i = 0; i < room.cardColumns.length; i++) {
      //const column = room.cardColumns[i];
      //const idx = column.findIndex((card) => card.nonce === nonce);
      //column.splice(idx, 1);
    //}
  //}));

  //socket.on('disconnect', () => {
    //console.log("User disconnected", clientId);
    //roomCodesByClientId[clientId].forEach(roomCode => {
      //const room = rooms[roomCode];
      //if (!room) return;
      //const member = room.members.find(member => member.ioClientId === clientId);
      //if (!member) return;

      //room.members.splice(room.members.indexOf(member), 1);

      //io.to(room.code).emit('room-update', room.code);
    //});
  //});

  socket.on('ping', (roomCode) => {
    socket.emit('pong', roomCode);
  });
});

// TODO: Move these routes to a separate file

app.get('/', (req, res) => res.render('frontend', {
  FRONTEND_ASSET_PATH: process.env.FRONTEND_ASSET_PATH
}));

app.get('/rooms/:id/actionItemsExport', async (req, res) => {
  const room = await redisService.json.get(`room:${req.params.id}`, '.');

  if (!room) return res.sendStatus(404);

  const toExport = room.actionItems
    .filter(actionItem => !actionItem.done)
    .map(actionItem => ({
      title: actionItem.title,
      date: actionItem.date,
    }));

  res.status(200).send(toExport);
});

app.get('/rooms/:id', async (req, res) => {
  const room = await redisService.json.get(`room:${req.params.id}`, '.');

  if (!room) return res.sendStatus(404);

  // Calculated fields
  room.members.forEach(member => {
    member.voteCount = member.votes.length;
  });
  const votesByNonce = room.members.reduce((acc, member) => {
    for (const vote of member.votes) {
      acc[vote] = acc[vote] || 0;
      acc[vote]++;
    }

    return acc;
  }, {});
  room.groups.forEach(group => {
    group.voteCount = votesByNonce[group.nonce] || 0;

    group.cards.forEach((card) => {
      card.isOwner = card.author === req.query.clientId;
    });
  });

  // Self profile
  const member = room.members.find(member => member.ioClientId === req.query.clientId);
  const me = member ? { ...member } : null;

  // Remove private data
  room.members.forEach(member => {
    delete member.ioClientId;
    delete member.votes;
  });
  room.groups.forEach(group => {
    group.cards.forEach((card) => {
      const isTextHidden = !room.revealImmediately && room.state === 'brainstorm' && card.author !== req.query.clientId;

      if (isTextHidden) card.text = 'Will be revealed in next stage.';
      delete card.author;
      delete card.authorName;
    });
  });

  res.status(200).send({
    ...room,
    me,
  });
});

app.post('/rooms', async (req, res) => {
  const code = await generateRoomCode();
  console.log("creating new room with code", code);

  const actionItems = (req.body.previousActionItems || []).map(actionItem => ({
    ...actionItem,
    nonce: generateClientId(),
    done: false,
  }));
  const startWithActionItemReview = actionItems.length && req.body.startWithActionItemReview;
  const state = startWithActionItemReview ? 'preReview' : 'brainstorm';
  const room = {
    name: req.body.name,
    code,
    members: [],
    state,
    format: req.body.format,
    groups: [],
    currentGroupIdx: 0,
    nonceOrder: [],
    voteCount: req.body.voteCount,
    isAnonymous: !!req.body.isAnonymous,
    revealImmediately: !!req.body.revealImmediately,
    previousActionItems: actionItems,
    actionItems,
    startWithActionItemReview,
    timerEnd: null,
  };

  const rkey = `room:${room.code}`;
  await redisService.json.set(rkey, '.', room);

  res.status(200).send(room);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
