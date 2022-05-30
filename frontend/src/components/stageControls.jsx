import { useContext } from 'preact/hooks';

import styled from 'styled-components';

import { SocketContext } from '../contexts/socket.jsx';
import { RoomContext } from '../contexts/room.jsx';
import {ROOM_STATES} from '../utils/roomStates.js';
import {ThemeContext} from '../contexts/theme.jsx';

const Container = styled.div`
  text-align: center;
  margin: 40px;
  margin-bottom: 20px;
  max-width: ${(props) => props.showPreReview ? '650px' : '475px'};
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
`;

const Chevron = styled.div`
  font-size: 45px;
  margin-top: -8px;
`;

const buttonBG = (props) => {
  if (props.active) return '#3880ff';

  return props.theme === 'dark' ? '#cacaca' : 'white';
}

const Button = styled.button`
  cursor: pointer;
  margin: 5px;
  padding: 10px;
  border: none;
  background-color: ${buttonBG};
  color: ${(props) => props.active ? 'white' : 'black'};
  flex: 1 1 0px;
  box-shadow: 0px 0px 7px rgba(0,0,0,0.2);
  border-radius: 5px;
`;

export const StageControls = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

  const isAllReady = !room.members.find((member) => !member.ready);

  const fireStage = (stage) => {
    const displayAlert = !isAllReady && room.state !== ROOM_STATES.REVIEW;
    if (displayAlert && !confirm("Not all members have indicated they're ready, are you sure you want to proceed?")) return;

    socket.emit('setState', room.code, stage);
  };

  const divider = (
    <Chevron>
      &rsaquo;
    </Chevron>
  );

  const showPreReview = !!room.previousActionItems.length;

  return (
    <Container showPreReview={showPreReview}>
      {showPreReview && (
        <>
          <Button
            onClick={() => fireStage(ROOM_STATES.PRE_REVIEW)}
            active={room.state === ROOM_STATES.PRE_REVIEW}
            theme={themeContext.theme}
          >
            Pre-Review
          </Button>
          {divider}
        </>
      )}
      <Button
        onClick={() => fireStage(ROOM_STATES.IDEA_GENERATION)}
        active={room.state === ROOM_STATES.IDEA_GENERATION}
        theme={themeContext.theme}
      >
        Brainstorm
      </Button>
      {divider}
      <Button
        onClick={() => fireStage(ROOM_STATES.GROUP)}
        active={room.state === ROOM_STATES.GROUP}
        theme={themeContext.theme}
      >
        Group
      </Button>
      {divider}
      <Button
        onClick={() => fireStage(ROOM_STATES.VOTE)}
        active={room.state === ROOM_STATES.VOTE}
        theme={themeContext.theme}
      >
        Vote
      </Button>
      {divider}
      <Button
        onClick={() => fireStage(ROOM_STATES.DISCUSS)}
        active={room.state === ROOM_STATES.DISCUSS}
        theme={themeContext.theme}
      >
        Discuss
      </Button>
      {divider}
      <Button
        onClick={() => fireStage(ROOM_STATES.REVIEW)}
        active={room.state === ROOM_STATES.REVIEW}
        theme={themeContext.theme}
      >
        Review
      </Button>
    </Container>
  );
}
