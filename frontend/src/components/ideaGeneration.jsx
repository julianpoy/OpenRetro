import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {RoomContext} from '../contexts/room.jsx';
import {SocketContext} from '../contexts/socket.jsx';

import { ColumnInput } from './columnInput.jsx';

import { FORMAT_COLUMNS } from '../utils/formats.js';
import {GridCard, GridColumn, GridColumnTitle, GridContainer, GridGroup} from './grid.jsx';
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
    console.log("dragend");
    if (dragTarget === undefined) return clearDrag();

    if (dragTargetType === 'card' && dragTarget.card.nonce === card.nonce) return clearDrag(); // Don't allow cards to be moved to themselves

    const groupNonce = dragTargetType === 'card' ? dragTarget.group.nonce : null;
    const columnIdx = dragTargetType === 'card' ? dragTarget.group.columnIdx : dragTarget;

    console.log("moving", room.code, groupNonce, dragItem.nonce, columnIdx);
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

    setDragTargetType('card');
    setDragTarget({
      group,
      card
    });
  };

  const sortByNonce = (a, b) => room.nonceOrder.indexOf(a.nonce) > room.nonceOrder.indexOf(b.nonce) ? 1 : -1;
  
  return (
    <GridContainer>
      {FORMAT_COLUMNS[room.format].map((column, idx) => (
        <GridColumn
          key={idx}
          onDragEnter={(event) => dragEnterColumn(event, idx)}
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
              {group.cards.sort(sortByNonce).map((card) => (
                <GridCard
                  key={card.nonce}
                  color={FORMAT_COLUMNS[room.format][card.columnIdx].color}
                  theme={themeContext.theme}
                  invisible={!room.revealImmediately && room.state === ROOM_STATES.IDEA_GENERATION && !card.isOwner}
                  onDragStart={(event) => dragStart(event, card)}
                  onDragEnd={(event) => dragEnd(event, card)}
                  onDragEnter={(event) => dragEnterCard(event, group, card)}
                  draggable>
                  {card.text}
                  {room.state === ROOM_STATES.IDEA_GENERATION && card.isOwner && (
                    <Delete onClick={() => deleteCard(group, card)}>&#x1F5D1;</Delete>
                  )}
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
