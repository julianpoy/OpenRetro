import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import styled from 'styled-components';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {Textarea} from './input.jsx';

const Container = styled.div`
  display: flex;

  > * {
    flex-grow: 1;
    height: 20px;
    min-height: 20px;
  }
`;

export const ColumnInput = ({
  columnIdx,
}) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  const [text, setText] = useState('');

  const submit = () => {
    if (text.length === 0) return;

    socket.emit('add', room.code, columnIdx, text, null);
    setText('');
  };

  const onChange = (event) => {
    setText(event.target.value);
  }

  const onKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <Container>
      <Textarea
        rows="1"
        value={text}
        onInput={onChange}
        onKeyDown={onKeyDown}
        placeholder="Press enter to submit"
      />
    </Container>
  );
};

