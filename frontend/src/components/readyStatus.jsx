import { useContext } from 'preact/hooks';

import styled from 'styled-components';

import PropTypes from 'prop-types';
import {SocketContext} from '../contexts/socket.jsx';
import {RoomContext} from '../contexts/room.jsx';
import {Button} from './button.jsx';

const StatusLine = styled.div`
  text-align: center;
`;

export const ReadyStatus = ({ members, me }) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  const readyUp = () => {
    socket.emit('ready', room.code);
  }

  const readyCount = members.filter(member => member.ready).length;

  return (
    <div>
      <StatusLine>
        ({readyCount}/{members.length} participants ready)&nbsp;
        <Button onClick={readyUp}>I'm Finished</Button>
      </StatusLine>

      {members.map((member) => (
        <div key={member.ioClientId}>
          {member.name}
          {' '}
          {member.ready ? <>&#9989;</> : <>&#10060;</>}
        </div>
      ))}

    </div>
  );
};

