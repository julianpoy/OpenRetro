import { useContext } from 'preact/hooks';

import styled from 'styled-components';
import {RoomContext} from '../contexts/room.jsx';
import {GameStatus} from './gameStatus.jsx';

const Container = styled.div`
  box-shadow: 0 0 7px lightgray;
  padding: 10px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  font-size: 1.7rem;
  margin-top: 0;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 14px;
`;

export const Header = () => {
  const room = useContext(RoomContext);

  return (
    <Container>
      <div>
        <Title>OpenRetro!</Title>
        <Tagline>
          A free and <a href="https://github.com/julianpoy/openretro">open source</a> retro tool.
        </Tagline>
      </div>
      {room && <GameStatus roomCode={room.code} />}
    </Container>
  );
}
