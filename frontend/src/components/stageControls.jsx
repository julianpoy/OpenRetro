import { useContext } from 'preact/hooks';

import styled from 'styled-components';

import { SocketContext } from '../contexts/socket.jsx';
import { RoomContext } from '../contexts/room.jsx';
import {ROOM_STATES} from '../utils/roomStates.js';

const Container = styled.div`
  text-align: center;
  margin: 40px;
  margin-bottom: 20px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
`;

const Chevron = styled.div`
  font-size: 45px;
  margin-top: -8px;
`;

const Button = styled.button`
  cursor: pointer;
  margin: 5px;
  padding: 10px;
  border: none;
  background-color: ${(props) => props.active ? '#3498db' : 'white'};
  color: ${(props) => props.active ? 'white' : 'black'};
  flex: 1 1 0px;
  box-shadow: 0px 0px 7px rgba(0,0,0,0.2);
  border-radius: 5px;
`;

export const StageControls = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  const isAllReady = !room.members.find((member) => !member.ready);

  const fireStage = (stage) => {
    if (!isAllReady && !confirm("Not all members have indicated they're ready, are you sure you want to proceed?")) return;

    socket.emit('setState', room.code, stage);
  };

  return (
    <Container>
      <Button
        onClick={() => fireStage(ROOM_STATES.IDEA_GENERATION)}
        active={room.state === ROOM_STATES.IDEA_GENERATION}
      >
        Brainstorm
      </Button>
      <Chevron>
        &rsaquo;
      </Chevron>
      <Button
        onClick={() => fireStage(ROOM_STATES.GROUP)}
        active={room.state === ROOM_STATES.GROUP}
      >
        Group
      </Button>
      <Chevron>
        &rsaquo;
      </Chevron>
      <Button
        onClick={() => fireStage(ROOM_STATES.VOTE)}
        active={room.state === ROOM_STATES.VOTE}
      >
        Vote
      </Button>
      <Chevron>
        &rsaquo;
      </Chevron>
      <Button
        onClick={() => fireStage(ROOM_STATES.DISCUSS)}
        active={room.state === ROOM_STATES.DISCUSS}
      >
        Discuss
      </Button>
    </Container>
  );
}
