import {useContext} from 'preact/hooks';
import styled from 'styled-components';

import {RoomContext} from "../contexts/room.jsx";
import {ThemeContext} from "../contexts/theme.jsx";
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
  color: ${(props) => props.theme === 'dark' ? 'lightblue' : 'blue'};
`;

export const Review = () => {
  const room = useContext(RoomContext);
  const themeContext = useContext(ThemeContext);

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
            <Download theme={themeContext.theme} href={`/rooms/${room.code}/actionItemsExport`} target="_blank" download={`OpenRetro - ${retroNameTruncated} ${today}.json`}>download your action items for next time.</Download>
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
