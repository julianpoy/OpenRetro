const express = require('express');
const morgan = require('morgan');
const os = require('os');
const path = require('path');
const pug = require('pug');
const crypto = require('crypto');
const url = require('url');
const animals = require('./animals.json');

const app = express();
app.use(morgan(':method :url :status :response-time ms'));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const server = app.listen(parseInt(process.env.PORT || 3000, 10));

const rooms = {};
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
const generateRoomCode = () => {
  const roomCode = generateRandomString(ROOM_CODE_LENGTH);

  if (!rooms[roomCode]) {
    return roomCode;
  }

  return generateRoomCode();
};

const CLIENT_ID_SIZE = 50;
const generateClientId = () => {
  return crypto.randomBytes(CLIENT_ID_SIZE).toString('hex');
};

const isValidRoomCode = roomCode => {
  const containsIllegalChar = (/[^A-Z0-9]/).test(roomCode);
  
  return !containsIllegalChar && roomCode.length === ROOM_CODE_LENGTH;
}

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

  // Have user rejoin any rooms they were previously in
  if (roomCodesByClientId[clientId]) roomCodesByClientId[clientId].forEach(roomId => socket.join(roomId));
  else roomCodesByClientId[clientId] = [];

  socket.on('join', (roomCode, name) => {
    console.log("Request to join room: ", roomCode);
    const room = rooms[roomCode];
    if (!room) return;

    socket.join(roomCode);

    if (!roomCodesByClientId[clientId].includes(roomCode)) roomCodesByClientId[clientId].push(roomCode);

    const existingMember = room.members.find(member => member.ioClientId === clientId);

    if (!existingMember) {
      room.members.push({
        ioClientId: clientId,
        ready: false,
        votes: [],
        name: room.isAnonymous ? getAnonymousName(room.members.map(member => member.name)) : name,
      });
    }

    io.to(roomCode).emit('room-update', roomCode);
  });

  const eventWrapper = (roomCode, cb) => {
    const room = rooms[roomCode];
    if (!room) return;

    const member = room.members.find(member => member.ioClientId === clientId);

    cb(room, member);

    io.to(roomCode).emit('room-update', roomCode);
  };

  socket.on('ready', (roomCode) => eventWrapper(roomCode, (room, member) => {
    if (member) member.ready = !member.ready;
  }));

  socket.on('setState', (roomCode, state) => eventWrapper(roomCode, (room, member) => {
    const validStates = ['start', 'group', 'vote', 'discuss'];

    if (validStates.includes(state)) {
      room.state = state;
    }

    room.members.forEach((member) => member.ready = false);
    if (state !== 'vote' && state !== 'discuss') room.members.forEach((member) => member.votes = []);
  }));

  socket.on('add', (roomCode, columnIdx, text, beforeNonce) => eventWrapper(roomCode, (room, member) => {
    console.log("adding");
    const card = {
      text,
      columnIdx,
      nonce: generateClientId(),
    };
    room.cards.push(card);
    room.groups.push({
      title: '',
      columnIdx,
      nonce: generateClientId(),
      cards: [card],
    });
    const beforeIdx = room.nonceOrder.indexOf(beforeNonce);
    if (beforeIdx > -1) room.nonceOrder.splice(beforeIdx, 0, card.nonce);
    else room.nonceOrder.push(card.nonce);
  }));

  socket.on('order', (roomCode, nonce, beforeNonce) => eventWrapper(roomCode, (room, member) => {
    const nonceIdx = room.nonceOrder.indexOf(nonce);
    if (nonceIdx > -1) room.nonceOrder.splice(nonceIdx, 1);

    const beforeNonceIdx = room.nonceOrder.indexOf(beforeNonce);
    if (beforeNonceIdx > -1) room.nonceOrder.splice(beforeNonceIdx, 0, nonce);
    else room.nonceOrder.push(nonce);
  }));

  socket.on('groupCard', (roomCode, groupNonce, cardNonce, columnIdx) => eventWrapper(roomCode, (room, member) => {
    for (let i = 0; i < room.groups.length; i++) {
      const group = room.groups[i];
      const cardIdx = group.cards.findIndex(card => card.nonce === cardNonce)
      if (cardIdx === -1) continue;

      const newGroup = room.groups.find(group => group.nonce === groupNonce);
      if (groupNonce && !newGroup) return;

      const card = group.cards.splice(cardIdx, 1)[0];
      if (room.state === 'start') card.columnIdx = columnIdx;
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
        });
      }

      return;
    }
  }));

  socket.on('vote', (roomCode, nonces) => eventWrapper(roomCode, (room, member) => {
    if (member && nonces.length <= room.voteCount) {
      member.votes = nonces;
    }
  }));

  //socket.on('moveCard', (roomCode, nonce, columnIdx) => eventWrapper(roomCode, (room, member) => {
    //const group = room.groups.find((group) => group.cards.find((card) => card.nonce === nonce));
    //if (group.cards.length > 1) return; // Groups must be moved with moveGroup, or card must be moved out of group via groupCard

    //group.columnIdx = columnIdx;
    //group.cards[0].columnIdx = columnIdx;
  //}));

  socket.on('moveGroup', (roomCode, nonce, columnIdx) => eventWrapper(roomCode, (room, member) => {
    const group = room.groups.find((group) => group.nonce === nonce);
    group.columnIdx = columnIdx;
    group.cards.forEach((card) => card.columnIdx = columnIdx);
  }));

  //socket.on('delete', (roomCode, nonce) => eventWrapper(roomCode, (room, member) => {
    //for (let i = 0; i < room.cardColumns.length; i++) {
      //const column = room.cardColumns[i];
      //const idx = column.findIndex((card) => card.nonce === nonce);
      //column.splice(idx, 1);
    //}
  //}));

  socket.on('reset', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.state = 'start';
    room.members.forEach(member => member.vote = null);

    io.to(roomCode).emit('room-update', roomCode);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected", clientId);
    roomCodesByClientId[clientId].forEach(roomCode => {
      const room = rooms[roomCode];
      if (!room) return;
      const member = room.members.find(member => member.ioClientId === clientId);
      if (!member) return;

      room.members.splice(room.members.indexOf(member), 1);

      io.to(room.code).emit('room-update', room.code);
    });
  });

  socket.on('ping', (roomCode) => {
    socket.emit('pong', roomCode);
  });
});

// TODO: Move these routes to a separate file

app.get('/', (req, res) => res.render('frontend', {
  FRONTEND_ASSET_PATH: process.env.FRONTEND_ASSET_PATH
}));


app.get('/rooms/:id', (req, res) => {
  const room = rooms[req.params.id];

  if (!room) return res.sendStatus(404);

  res.status(200).send(room);
});

app.post('/rooms', (req, res) => {
  const room = {
    code: generateRoomCode(),
    members: [],
    state: 'start',
    format: req.body.format,
    cards: [],
    groups: [],
    nonceOrder: [],
    voteCount: req.body.voteCount,
    isAnonymous: req.body.isAnonymous || false,
  };

  rooms[room.code] = room;

  res.status(200).send(room);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
