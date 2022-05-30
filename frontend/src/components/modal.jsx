import { useContext } from 'preact/hooks';
import styled from 'styled-components';

import {ThemeContext} from '../contexts/theme.jsx';
import {Button} from './button.jsx';

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.2);
`;

const Container = styled.div`
  background: ${(props) => props.theme === 'dark' ? '#0b0b0b' : 'white'};
  box-shadow: 0 0 7px rgba(0,0,0,0.4);
  position: absolute;
  width: 400px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`;

const Title = styled.div`
  font-size: 18px;
  padding: 16px;
  box-shadow: 0 0 7px rgba(0,0,0,0.2);
`;

const Message = styled.div`
  padding: 16px;
  font-size: 14px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: end;
  padding: 5px;
`;

export const Modal = ({
  title,
  message,
  confirmText,
  rejectText,
  onConfirm,
  onReject
}) => {
  const themeContext = useContext(ThemeContext);

  return (
    <>
      <Backdrop />
      <Container theme={themeContext.theme}>
        <Title>
          {title}
        </Title>
        <Message>
          {message}
        </Message>
        <ButtonsContainer>
          <Button onClick={onConfirm}>{confirmText || 'Ok'}</Button>
          {onReject && <Button onClick={onReject}>{rejectText || 'Cancel'}</Button>}
        </ButtonsContainer>
      </Container>
    </>
  );
};
