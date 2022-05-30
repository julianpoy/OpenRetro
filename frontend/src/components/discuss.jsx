import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import styled from 'styled-components';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import { FORMAT_COLUMNS } from '../utils/formats.js';
import {Button} from './button.jsx';
import {ActionItems} from './actionItems.jsx';
import {GridCard, GridGroup} from './grid.jsx';

const Controls = styled.div`
  text-align: center;
`;

const ScrollingGrid = styled.div`
  white-space: nowrap;
  max-width: 100%;
  overflow-x: hidden;
`;

const StyledGridGroup = styled(GridGroup)`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
  margin-right: 20px;

  ${(props) => props.active ? '' : 'opacity: 0.5;'}
`;

export const Discuss = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const [padderWidth, setPadderWidth] = useState(window.innerWidth);
  const [currentGroup, setCurrentGroup] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setPadderWidth(window.innerWidth);
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const groups = document.getElementsByClassName('group-entry');
    const group = groups[currentGroup];
    if (!group) return;
    group.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
  }, [currentGroup, padderWidth]);

  const move = (direction) => {
    const nextGroup = currentGroup + direction;
    if (nextGroup > room.groups.length - 1) return;
    if (nextGroup < 0) return;
    setCurrentGroup(nextGroup);
  };
  const atMax = currentGroup + 1 >= room.groups.length;
  const atMin = currentGroup <= 0;

  const sortByNonce = (a, b) => room.nonceOrder.indexOf(a.nonce) > room.nonceOrder.indexOf(b.nonce) ? 1 : -1;

  const sortByVotes = (a, b) => {
    const diff = a.voteCount - b.voteCount;
    if (!diff) return a.nonce.localeCompare(b.nonce); // Keep sort order consistent if vote count is the same
    return diff < 0 ? 1 : -1;
  };

  const groupWidth = Math.min(window.innerWidth, 400);

  const padderStyles = {
    display: 'inline-block',
    marginLeft: `${padderWidth}px`,
  };

  return (
    <>
      <Controls>
        <Button onClick={() => move(-1)} disabled={atMin}>&lt; Previous</Button>
        <Button onClick={() => move(1)} disabled={atMax}>Next &gt;</Button>
      </Controls>
      <ScrollingGrid>
        <div style={padderStyles}></div>
        {room.groups.sort(sortByVotes).map((group, idx) => (
          <StyledGridGroup
            key={group.nonce}
            width={groupWidth}
            className="group-entry"
            onClick={() => setCurrentGroup(idx)}
            active={currentGroup === idx}
          >
            {group.voteCount} Votes
            {group.cards.sort(sortByNonce).map((card) => (
              <GridCard
                key={card.nonce}
                color={FORMAT_COLUMNS[room.format][card.columnIdx].color}
              >
                {card.text}
              </GridCard>
            ))}
            <ActionItems group={group} />
          </StyledGridGroup>
        ))}
        <div style={padderStyles}></div>
      </ScrollingGrid>
    </>
  );
};

