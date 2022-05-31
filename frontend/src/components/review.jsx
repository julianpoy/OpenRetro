import {useContext} from 'preact/hooks';
import styled from 'styled-components';

import {RoomContext} from "../contexts/room.jsx";
import {ActionItemReview} from "./actionItemReview.jsx";

const Container = styled.div`
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const ActionItemsHeader = styled.h3`
  text-align: center;
  margin-top: 50px;
`;

const Download = styled.a`
  color: lightblue;
`;

export const Review = () => {
  const room = useContext(RoomContext);

  const today = new Date().toLocaleDateString().replaceAll('/', '-');

  const retroNameTruncated = room.name.substring(0, 30);

  return (
    <Container>
      <div>
        The retro is complete.
        {room.actionItems.length > 0 && (
          <>
            {' '}
            You may close this page, but to save your state,&nbsp;
            <Download href={`/rooms/${room.code}/actionItemsExport`} target="_blank" download={`OpenRetro - ${retroNameTruncated} ${today}.json`}>download your action items for next time.</Download>
          </>
        )}
      </div>

      <ActionItemsHeader>
        Action Items:
      </ActionItemsHeader>
      <ActionItemReview />
    </Container>
  )
};
