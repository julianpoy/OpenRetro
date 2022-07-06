import {useContext} from 'preact/hooks';
import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import {ThemeContext} from '../contexts/theme.jsx';
import {Input} from './input.jsx';

const Container = styled.div`
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const ActionItemCheckbox = styled(Input)`
  margin-right: 10px;
`;

const ActionItem = styled.label`
  display: flex;
  justify-content: space-between;
  box-shadow: 0 0 7px ${(props) => props.theme === 'dark' ? 'black' : 'rgba(0,0,0,0.2)'};
  padding: 10px;
  margin: 10px;
  background: ${(props) => props.theme === 'dark' ? '#222' : 'white'};
  border-radius: 5px;
`;

export const ActionItemReview = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

  if (!room.actionItems.length) return (
    <Container>
      No action items!
    </Container>
  );

  const sortByDate = (a, b) => b.date - a.date;

  const prettifyDate = (stamp) => {
    const date = new Date(stamp);
    return date.toLocaleDateString();
  };

  const onItemChecked = (event, item) => {
    socket.emit('actionItem.update', room.code, item.nonce, item.title, !item.done);
  };

  return (
    <Container>
      {room.actionItems.sort(sortByDate).map(item => (
        <ActionItem theme={themeContext.theme}>
          <div>
            <ActionItemCheckbox type="checkbox" checked={item.done} onClick={(event) => onItemChecked(event, item)} />
            {item.title}
          </div>
          <div>
            {prettifyDate(item.date)}
          </div>
        </ActionItem>
      ))}
    </Container>
  );
};
