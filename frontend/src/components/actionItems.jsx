import { useState, useContext } from 'preact/hooks';
import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {ThemeContext} from '../contexts/theme.jsx';
import {Input} from './input.jsx';
import {IconButton} from './button.jsx';

const Container = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  width: 400px;
  margin: 10px;
`;

const ActionItemsContainer = styled.div`
  box-shadow: 0 0 7px ${(props) => props.theme === 'dark' ? 'black' : 'rgba(0,0,0,0.2)'};
  border-radius: 5px;
  margin: 5px 0px;
  background: ${(props) => props.theme === 'dark' ? '#222' : 'white'};
`;

const ActionItem = styled.div`
  padding: 10px;
  font-size: 14px;
  border-top: 1px solid ${(props) => props.theme === 'dark' ? 'darkgray' : 'lightgray'};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:first-child {
    border: none;
  }
`;

const StyledInputActionItem = styled(Input)`
  flex-grow: 1;
`;

const Delete = styled(IconButton)`
  color: red;
  margin: 0;
  font-size: 20px;
`;

export const ActionItems = ({
  group,
}) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);
  const [value, setValue] = useState('');

  const actionItemKeydown = (event, group) => {
    if (event.keyCode !== 13) return;
    if (!value?.trim().length) return;

    socket.emit('actionItem.create', room.code, group.nonce, value);
    setValue('');
  };

  const deleteItem = (actionItem) => {
    socket.emit('actionItem.update', room.code, actionItem.nonce, actionItem.title, actionItem.done, true);
  };

  return (
    <Container>
      <StyledInputActionItem
        placeholder="Add action item..."
        onKeyDown={(event) => actionItemKeydown(event, group)}
        onChange={(event) => setValue(event.target.value)}
        value={value}
      />
      <ActionItemsContainer theme={themeContext.theme}>
        {group.actionItems.map((actionItem, idx) => (
          <ActionItem key={idx} theme={themeContext.theme}>
            <div>
              {actionItem.title}
            </div>
            <Delete onClick={() => deleteItem(actionItem)}>&#x1F5D1;</Delete>
          </ActionItem>
        ))}
      </ActionItemsContainer>
    </Container>
  );
};
