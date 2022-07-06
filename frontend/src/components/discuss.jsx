import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import styled from 'styled-components';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import { FORMAT_COLUMNS } from '../utils/formats.js';
import {Button} from './button.jsx';
import {ActionItems} from './actionItems.jsx';
import {GridCard, GridGroup} from './grid.jsx';
import {ThemeContext} from '../contexts/theme.jsx';

const Controls = styled.div`
  text-align: center;
`;

const ScrollingGrid = styled.div`
  white-space: nowrap;
  max-width: 100%;
  overflow-x: hidden;

  > * {
    white-space: normal;
  }
`;

const DiscussionItem = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
  margin-right: 20px;
  ${(props) => props.active ? '' : 'opacity: 0.5;'}
`;

export const Discuss = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);
  const [padderWidth, setPadderWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => {
      setPadderWidth(window.innerWidth);
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const groups = document.getElementsByClassName('group-entry');
    const group = groups[room.currentGroupIdx];
    if (!group) return;
    group.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
  }, [room.currentGroupIdx, padderWidth]);

  const setCurrentGroup = (idx) => {
    socket.emit('setCurrentGroup', room.code, idx);
  };

  const move = (direction) => {
    const nextGroup = room.currentGroupIdx + direction;
    if (nextGroup > room.groups.length - 1) return;
    if (nextGroup < 0) return;

    setCurrentGroup(nextGroup);
  };
  const atMax = room.currentGroupIdx + 1 >= room.groups.length;
  const atMin = room.currentGroupIdx <= 0;

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
          <DiscussionItem onClick={() => setCurrentGroup(idx)} active={room.currentGroupIdx === idx}>
            <GridGroup
              key={group.nonce}
              width={groupWidth}
              className="group-entry"
              theme={themeContext.theme}
            >
              <p>
                <b>
                  {group.voteCount} Vote{group.voteCount !== 1 && 's'}
                </b>
              </p>
              {group.cards.length > 1 && group.title && (
                <div>
                  {group.title}
                </div>
              )}
              {group.cards.sort(sortByNonce).map((card) => (
                <GridCard
                  key={card.nonce}
                  color={FORMAT_COLUMNS[room.format][card.columnIdx].color}
                  theme={themeContext.theme}
                >
                  {card.text}
                </GridCard>
              ))}
            </GridGroup>
            <ActionItems group={group} />
          </DiscussionItem>
        ))}
        <div style={padderStyles}></div>
      </ScrollingGrid>
    </>
  );
};

