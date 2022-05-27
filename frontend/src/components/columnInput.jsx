import { useEffect, useContext, useRef, useState } from 'preact/hooks';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {Input} from './input.jsx';

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
    if (event.keyCode === 13) submit();
  }

  return (
    <Input
      value={text}
      onInput={onChange}
      onKeyDown={onKeyDown}
      placeholder="Press enter to submit"
    />
  );
};

