import PropTypes from 'prop-types';
import { useState, useEffect } from 'preact/hooks';
import styled from 'styled-components';

import { CreateRoom } from './createRoom.jsx';
import {Button} from './button.jsx';
import {Input} from './input.jsx';

const Container = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

export const Welcome = ({ setRoom, socket }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const [roomCode, setRoomCode] = useState(urlParams.get('sessionCode') || '');
  const [userName, setUserName] = useState(localStorage.getItem('nickname') || '');
  const [showCreating, setShowCreating] = useState(false);

  const joinRoom = async () => {
    const room = await fetch(`/rooms/${roomCode.toUpperCase()}?clientId=${socket.io.engine.id}`, {
      method: 'GET',
    }).then((resp) => resp.json()).catch(() => {
      window.history.pushState(null, '', window.location.origin)
    });

    setRoom(room);

    console.log("joining", room.code, userName);
    setTimeout(() => {
      socket.emit('join', room.code, userName);
    });

    try {
      localStorage.setItem('nickname', userName);
    } catch (e) {}
  };

  useEffect(() => {
    if (roomCode && userName) {
      joinRoom();
    }
  }, []);

  const onRoomCodeInput = (event) => {
    setRoomCode(event.target.value);
  };

  const onUserNameInput = (event) => {
    setUserName(event.target.value);
  };

  if (showCreating) return (
    <CreateRoom setRoom={setRoom} socket={socket} cancelCreating={() => setShowCreating(false)} />
  );

  return (
    <Container>
      <Button
        onClick={() => setShowCreating(true)}
      >
        Create a New Retro
      </Button>
      <br />
      <p>
        or, join an existing retrospective
      </p>
      <Input
        value={userName}
        type="text"
        placeholder="Your Nickname"
        onChange={onUserNameInput}
      />
      <br />
      <Input
        value={roomCode}
        type="text"
        placeholder="Retro Room Code"
        onChange={onRoomCodeInput}
      />
      <br />
      <Button
        onClick={joinRoom}
      >
        Join Retro
      </Button>
    </Container>
  );
};

Welcome.propTypes = {
  setRoom: PropTypes.function,
  socket: PropTypes.any,
};
