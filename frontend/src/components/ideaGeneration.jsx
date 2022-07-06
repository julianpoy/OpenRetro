import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';

import { ColumnInput } from './columnInput.jsx';

import { FORMAT_COLUMNS } from '../utils/formats.js';
import {GridCard, GridCardContent, GridColumn, GridColumnTitle, GridContainer, GridGroup} from './grid.jsx';
import {ROOM_STATES} from '../utils/roomStates.js';
import {IconButton} from './button.jsx';
import {Input} from './input.jsx';
import {GroupName} from './groupName.jsx';
import {ThemeContext} from '../contexts/theme.jsx';
import {ModalContext} from '../contexts/modal.jsx';

const Delete = styled(IconButton)`
  position: absolute;
  top: 5px;
  right: 5px;
  color: red;
  margin: 0;
  font-size: 20px;
`;

export const IdeaGeneration = ({ disableInput }) => {
  const socket = useContext(SocketContext);
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);
  const modal = useContext(ModalContext);

  const [dragItem, setDragItem] = useState();
  const [dragTarget, setDragTarget] = useState();
  const [dragTargetType, setDragTargetType] = useState();
  const [isBeforeTarget, setIsBeforeTarget] = useState(false);

  const deleteCard = (group, card) => {
    const onConfirm = () => {
      socket.emit('card.delete', room.code, group.nonce, card.nonce);
    };

    modal.show({
      title: "Warning",
      message: "Are you sure you want to delete this card?",
      confirmText: "Delete",
      onConfirm: () => (modal.dismiss(), onConfirm()),
      onReject: () => modal.dismiss(),
    });
  };
  
  const dragStart = (event, card) => {
    setDragItem(card);
  };

  const clearDrag = () => {
    setDragTargetType();
    setDragTarget();
    setDragItem();
  }

  const dragEnd = (event, card) => {
    if (dragTarget === undefined) return clearDrag();

    if (dragTargetType === 'card' && dragTarget.card.nonce === card.nonce) return clearDrag(); // Don't allow cards to be moved to themselves

    const groupNonce = dragTargetType === 'card' ? dragTarget.group.nonce : null;
    const columnIdx = dragTargetType === 'card' ? dragTarget.group.columnIdx : dragTarget;

    if (dragTargetType === 'card') socket.emit('order', room.code, dragItem.nonce, dragTarget.beforeNonce);
    socket.emit('groupCard', room.code, groupNonce, dragItem.nonce, columnIdx);

    clearDrag();
  };

  const dragEnterColumn = (event, idx) => {
    event.stopPropagation();

    setDragTargetType('column');
    setDragTarget(idx);
  };

  const dragEnterCard = (event, group, card) => {
    event.stopPropagation();

    // Cards can only be moved between columns in idea generation stage
    if (room.state === ROOM_STATES.IDEA_GENERATION) return;

    const bbox = event.target.getBoundingClientRect();
    const targetOffset = bbox.y + (bbox.height / 2);
    const isAfter = event.clientY - targetOffset > 0;
    const idxModifier = isAfter ? 1 : 0;

    const beforeNonce = room.nonceOrder[room.nonceOrder.indexOf(card.nonce) + idxModifier] || null;
    const afterNonce = room.nonceOrder[room.nonceOrder.indexOf(card.nonce) + idxModifier - 1] || null;

    setDragTargetType('card');
    setDragTarget({
      group,
      card,
      beforeNonce,
      afterNonce,
    });
  };

  const sortByNonce = (a, b) => room.nonceOrder.indexOf(a.nonce) > room.nonceOrder.indexOf(b.nonce) ? 1 : -1;
  
  return (
    <GridContainer>
      {FORMAT_COLUMNS[room.format].map((column, idx) => (
        <GridColumn
          key={idx}
          onDragOver={(event) => dragEnterColumn(event, idx)}
          dropEffect={dragTargetType === 'column' && dragTarget === idx}
        >
          <GridColumnTitle>
            {column.title}
          </GridColumnTitle>
          {disableInput ? null : <ColumnInput columnIdx={idx} />}
          {room.groups.filter(group => group.columnIdx === idx).sort(sortByNonce).map((group) => (
            <GridGroup
              key={group.nonce}
              dropEffect={dragTargetType === 'card' && dragTarget?.group?.nonce === group.nonce}
              backdrop={group.cards.length > 1}
              theme={themeContext.theme}
            >
              {group.cards.length > 1 && <GroupName group={group} />}
              {group.cards.sort(sortByNonce).map((card, cardIdx, cards) => (
                <GridCard
                  key={card.nonce}
                  theme={themeContext.theme}
                  invisible={!room.revealImmediately && room.state === ROOM_STATES.IDEA_GENERATION && !card.isOwner}
                  showDropBeforeBorder={dragTarget?.group?.nonce === group.nonce && dragTarget?.beforeNonce === card.nonce}
                  showDropAfterBorder={dragTarget?.group?.nonce === group.nonce && dragTarget?.afterNonce === card.nonce && cardIdx === cards.length - 1}
                  onDragStart={(event) => dragStart(event, card)}
                  onDragEnd={(event) => dragEnd(event, card)}
                  onDragOver={(event) => dragEnterCard(event, group, card)}
                  draggable>
                  <GridCardContent
                    color={FORMAT_COLUMNS[room.format][card.columnIdx].color}
                  >
                    {card.text}
                    {room.state === ROOM_STATES.IDEA_GENERATION && card.isOwner && (
                      <Delete onClick={() => deleteCard(group, card)}>&#x1F5D1;</Delete>
                    )}
                  </GridCardContent>
                </GridCard>
              ))}
            </GridGroup>
          ))}
        </GridColumn>
      ))}
    </GridContainer>
  );
};

IdeaGeneration.propTypes = {
  room: PropTypes.any,
  socket: PropTypes.any,
};
