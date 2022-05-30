import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import styled from 'styled-components';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';
import { FORMAT_COLUMNS } from '../utils/formats.js';
import {Button} from './button.jsx';
import {GridCard, GridColumn, GridColumnTitle, GridContainer, GridGroup} from './grid.jsx';

const VotesRemaining = styled.div`
  margin: 10px;
  text-align: center;
  font-weight: bold;
`;

const VoteContainer = styled.span`
  display: grid;
  grid-template-columns: 40px 40px 40px;
  align-items: center;
  justify-content: center;
`;

const VoteCount = styled.span`
  margin-left: 5px;
  margin-right: 5px;
`;

const GroupTitle = styled.div`
  text-align: left;
  font-size: 14px;
`;

export const Vote = () => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);

  const sortByNonce = (a, b) => room.nonceOrder.indexOf(a.nonce) > room.nonceOrder.indexOf(b.nonce) ? 1 : -1;

  const atMaxVotes = room.me.votes.length === room.voteCount;

  const getVotesForNonce = (nonce) => {
    return room.me.votes.filter((vote) => vote === nonce);
  }

  const vote = (nonce, direction) => {
    const votes = [...room.me.votes];
    if (direction === -1) {
      const idx = room.me.votes.indexOf(nonce);
      votes.splice(idx, 1);
    } else {
      votes.push(nonce);
    }

    socket.emit('vote', room.code, votes);
  }

  return (
    <>
      <VotesRemaining>
        Votes remaining: {room.voteCount - room.me.votes.length}
      </VotesRemaining>

      <GridContainer>
        {FORMAT_COLUMNS[room.format].map((column, idx) => (
          <GridColumn key={idx} onDragEnter={(event) => dragEnterColumn(event, idx)}>
            <GridColumnTitle>
              {column.title}
            </GridColumnTitle>
            {room.groups.filter(group => group.columnIdx === idx).sort(sortByNonce).map((group) => (
              <GridGroup key={group.nonce}>
                <VoteContainer>
                  <Button onClick={() => vote(group.nonce, -1)} disabled={!getVotesForNonce(group.nonce).length}>-</Button>
                  <VoteCount>
                    {getVotesForNonce(group.nonce).length}
                  </VoteCount>
                  <Button onClick={() => vote(group.nonce, 1)} disabled={atMaxVotes}>+</Button>
                </VoteContainer>
                
                {group.cards.length > 1 && (
                  <GroupTitle>
                    {group.title}
                  </GroupTitle>
                )}
                {group.cards.sort(sortByNonce).map((card) => (
                  <GridCard
                    key={card.nonce}
                    color={FORMAT_COLUMNS[room.format][card.columnIdx].color}
                  >
                    {card.text}
                  </GridCard>
                ))}
              </GridGroup>
            ))}
          </GridColumn>
        ))}
      </GridContainer>
    </>
  );
};

