import { useState, useContext } from 'preact/hooks';
import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {Input} from './input.jsx';

const Container = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const ActionItemsContainer = styled.div`
  box-shadow: 0 0 7px rgba(0,0,0,0.2);
  border-radius: 5px;
`;

const ActionItem = styled.div`
  padding: 10px;
  font-size: 14px;
  border-top: 1px solid lightgray;

  &:first-child {
    border: none;
  }
`;

const StyledInputActionItem = styled(Input)`
  flex-grow: 1;
`;

export const ActionItems = ({
  group,
}) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const [value, setValue] = useState('');

  const actionItemKeydown = (event, group) => {
    if (event.keyCode !== 13) return;

    socket.emit('createActionItem', room.code, group.nonce, value);
    setValue('');
  };

  return (
    <Container>
      <StyledInputActionItem
        placeholder="Add action item..."
        onKeyDown={(event) => actionItemKeydown(event, group)}
        onChange={(event) => setValue(event.target.value)}
        value={value}
      />
      <ActionItemsContainer>
        {group.actionItems.map((actionItem, idx) => (
          <ActionItem key={idx}>
            {actionItem.title}
          </ActionItem>
        ))}
      </ActionItemsContainer>
    </Container>
  );
};
