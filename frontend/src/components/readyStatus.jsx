import { useContext, useState } from 'preact/hooks';

import styled from 'styled-components';

import PropTypes from 'prop-types';
import {SocketContext} from '../contexts/socket.jsx';
import {RoomContext} from '../contexts/room.jsx';
import {Button, ClearButton} from './button.jsx';
import {Timer} from './timer.jsx';
import {Popover} from './popover.jsx';
import {ThemeContext} from '../contexts/theme.jsx';

const StatusLine = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const ParticipantsButton = styled(ClearButton)`
  font-size: 16px;
  margin: 0;
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

const You = styled.span`
  color: ${(props) => props.theme === 'dark' ? 'lightblue' : 'blue'};
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

  const participantsPopover = (
    <Popover theme={themeContext.theme}>
      {members.map((member) => (
        <Participant key={member.ioClientId}>
          <span>
            {member.ready ? <>&#9989;</> : <>&#10060;</>}
            {' '}
            {member.name}
            <You theme={themeContext.theme}>{room.me.nonce === member.nonce && ' (you)'}</You>
          </span>
          {room.state === 'vote' && (
            <VoteBubbleContainer>
              {Array.from({ length: room.voteCount }, () => 0).map((_, i) => (
                <VoteBubble filled={i < member.voteCount} />
              ))}
            </VoteBubbleContainer>
          )}
        </Participant>
      ))}
    </Popover>
  );

  return (
    <div>
      <StatusLine>
        ({readyCount}/{members.length} <ParticipantsButton onClick={() => setShowParticipants(!showParticipants)}>participants</ParticipantsButton> ready)&nbsp;
        {showParticipants && participantsPopover}
        <Button onClick={readyUp}>{room.me.ready ? 'Not Finished' : 'I\'m Finished'}</Button>
        <Timer />
      </StatusLine>
    </div>
  );
};

