import { useState, useRef, useEffect, useContext } from 'preact/hooks';
import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {ThemeContext} from '../contexts/theme.jsx';
import {IconButton} from './button.jsx';
import {ClearButton} from './button.jsx';
import {Input} from './input.jsx';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GroupNameEdit = styled(Input)`
  width: calc(100% - 18px);
  padding: 5px;
`;

const EditIcon = styled(IconButton)`
  color: #3880ff;
  margin: 0;
  margin-top: -5px;
  margin-right: 5px;
`;

const Title = styled.div`
  text-align: left;
  font-size: 14px;
  cursor: pointer;
`;

const Unnamed = styled.div`
  text-align: left;
  font-size: 12px;
  font-style: italic;
  color: ${(props) => props.theme === 'dark' ? 'lightgray' : 'gray'};
  padding: 2px;
  cursor: pointer;
`;

export const GroupName = ({ group }) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(group.title);
  const ref = useRef();

  const onStartEdit = () => {
    setTitle(group.title);
    setEditing(true);
  }

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const save = (event) => {
    event?.stopPropagation();
    socket.emit('group.rename', room.code, group.nonce, title);
    setEditing(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      save();
    }

    if (event.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) return (
    <Container>
      <GroupNameEdit
        placeholder="Group Name"
        ref={ref}
        onKeyDown={onKeyDown}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <ClearButton onClick={save}>
        &#128190;
      </ClearButton>
    </Container>
  );

  if (!group.title) return (
    <Container onClick={onStartEdit}>
      <Unnamed theme={themeContext.theme}>
        Click to add group name...
      </Unnamed>
      <EditIcon>&#9998;</EditIcon>
    </Container>
  );

  return (
    <Container onClick={onStartEdit}>
      <Title>
        {group.title}
      </Title>
      <EditIcon>&#9998;</EditIcon>
    </Container>
  );
};
