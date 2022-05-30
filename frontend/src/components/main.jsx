import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'preact/hooks';

import { Welcome } from './welcome.jsx';

import {SocketContext} from '../contexts/socket.jsx';
import {RoomContext} from '../contexts/room.jsx';
import {Header} from './header.jsx';
import {Game} from './game.jsx';
import {Footer} from './footer.jsx';
import {ThemeContextProvider} from '../contexts/theme.jsx';

let connectionOpts;
let clientId;
try {
  clientId = localStorage.getItem('clientId');

  if (clientId) {
    connectionOpts = {
      query: {
        clientId,
      },
    };
  }
} catch (e) {}

const socket = io(window.location.origin, connectionOpts);

socket.on('reconnect_attempt', () => {
  socket.io.opts.query = {
    clientId,
  };
});

socket.on('connect', () => {
  clientId = socket.io.engine.id;
  console.log('Connected', clientId);

  localStorage.setItem('clientId', clientId);
});

window.onpopstate = function (e) {
  window.location.reload();
};

export const Main = () => {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const roomUpdateHandler = async (roomCode) => {
      if (!room || room.code !== roomCode) return;

      const roomUpdate = await fetch(`/rooms/${roomCode.toUpperCase()}?clientId=${clientId}`, {
        method: 'GET',
      }).then((resp) => resp.json());

      setRoom(roomUpdate);
    }

    socket.on('room-update', roomUpdateHandler);
    socket.on('pong', roomUpdateHandler);

    return () => {
      socket.off('room-update', roomUpdateHandler);
      socket.off('pong', roomUpdateHandler);
    };
  }, [room]);

  useEffect(() => {
    if (!room?.code) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const launchRoomCode = urlParams.get('sessionCode');
      if (!launchRoomCode) window.history.pushState(null, '', `${window.location.origin}/?sessionCode=${room.code}`);
    } catch (e) {}
  }, [room?.code]);

  if (!room) return (
    <ThemeContextProvider>
      <SocketContext.Provider value={socket}>
        <Header />
        <Welcome setRoom={setRoom} socket={socket} />
        <Footer />
      </SocketContext.Provider>
    </ThemeContextProvider>
  );

  return (
    <ThemeContextProvider>
      <SocketContext.Provider value={socket}>
        <RoomContext.Provider value={room}>
          <Game />
          <Footer />
        </RoomContext.Provider>
      </SocketContext.Provider>
    </ThemeContextProvider>
  );
};
