import { useContext, useState } from 'preact/hooks';

import styled from 'styled-components';

import PropTypes from 'prop-types';
import {SocketContext} from '../contexts/socket.jsx';
import {RoomContext} from '../contexts/room.jsx';
import {Button, ClearButton} from './button.jsx';
import {ThemeContext} from '../contexts/theme.jsx';

const StatusLine = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const ParticipantsButton = styled(ClearButton)`
  font-size: 16px;
  margin: 0;
`;

const ParticipantsPopover = styled.div`
  position: absolute;
  width: 300px;
  max-width: 100%;
  margin-top: -20px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  background: ${(props) => props.theme === 'dark' ? 'black' : 'white'};
  box-shadow: 0 0 7px rgba(0,0,0,0.3);
  padding: 15px;
  font-size: 14px;
`;

const Participant = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VoteBubbleContainer = styled.div`

`;

const VoteBubble = styled.div`
  border-radius: 100%;
  border: 1px solid lightgray;
  ${(props) => props.filled && 'background-color: lightgray;'}
  display: inline-block;
  width: 10px;
  height: 10px;
  vertical-align: middle;
  margin-left: 1px;
`;

export const ReadyStatus = ({ members, me }) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

  const [showParticipants, setShowParticipants] = useState(false);

  const readyUp = () => {
    socket.emit('ready', room.code);
  }

  const readyCount = members.filter(member => member.ready).length;

  return (
    <div>
      <StatusLine>
        ({readyCount}/{members.length} <ParticipantsButton onClick={() => setShowParticipants(!showParticipants)}>participants</ParticipantsButton> ready)&nbsp;
        <Button onClick={readyUp}>{room.me.ready ? 'Not Finished' : 'I\'m Finished'}</Button>
      </StatusLine>

      {showParticipants && (
        <ParticipantsPopover theme={themeContext.theme}>
          {members.map((member) => (
            <Participant key={member.ioClientId}>
              {member.ready ? <>&#9989;</> : <>&#10060;</>}
              {' '}
              {member.name}
              {room.state === 'vote' && (
                <VoteBubbleContainer>
                  {Array.from({ length: room.voteCount }, () => 0).map((_, i) => (
                    <VoteBubble filled={i < room.me.voteCount} />
                  ))}
                </VoteBubbleContainer>
              )}
            </Participant>
          ))}
        </ParticipantsPopover>
      )}
    </div>
  );
};

