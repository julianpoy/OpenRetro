import { useContext } from 'preact/hooks';

import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {ThemeContext} from '../contexts/theme.jsx';
import {GameStatus} from './gameStatus.jsx';

const Container = styled.div`
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${(props) => props.theme === 'dark' && 'background: #203142' }
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  font-size: 1.7rem;
  margin-top: 0;

  > a {
    text-decoration: none;
    color: inherit;
  }
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 14px;
  
  > a {
    color: ${(props) => props.theme === 'dark' ? 'lightblue' : 'blue'};
  }
`;

export const Header = () => {
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

  return (
    <Container theme={themeContext.theme}>
      <div>
        <Title>
          <a href="/">OpenRetro!</a>
        </Title>
        <Tagline theme={themeContext.theme}>
          A free and <a href="https://github.com/julianpoy/openretro">open source</a> retro tool.
        </Tagline>
      </div>
      {room && <GameStatus roomCode={room.code} />}
    </Container>
  );
}
