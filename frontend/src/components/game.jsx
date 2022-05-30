import { useContext } from 'preact/hooks';
import styled from 'styled-components';

import { IdeaGeneration } from './ideaGeneration.jsx';
import { SocketConnectionGuard } from './socketConnectionGuard.jsx';

import {SocketContext} from '../contexts/socket.jsx';
import {RoomContext} from '../contexts/room.jsx';
import {Vote} from './vote.jsx';
import {Discuss} from './discuss.jsx';
import {Header} from './header.jsx';
import {StageControls} from './stageControls.jsx';
import {GameStatus} from './gameStatus.jsx';
import {ReadyStatus} from './readyStatus.jsx';
import {ROOM_STATES} from '../utils/roomStates.js';

//const SplitPane = styled.div`
  //display: grid;
  //grid-template-columns: auto 250px;
//`;

export const Game = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  const gameStates = {
    [ROOM_STATES.IDEA_GENERATION]: <IdeaGeneration blind={room.blind} />,
    [ROOM_STATES.GROUP]: <IdeaGeneration disableInput={true} />,
    [ROOM_STATES.VOTE]: <Vote />,
    [ROOM_STATES.DISCUSS]: <Discuss />,
  };

  return (
    <div>
      <Header />
      <SocketConnectionGuard>
        <StageControls />
        <ReadyStatus members={room.members} me={room.me} />
        {gameStates[room.state]}
      </SocketConnectionGuard>
    </div>
  );
}
