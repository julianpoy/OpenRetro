import styled from 'styled-components';

export const Popover = styled.div`
  position: absolute;
  width: 300px;
  max-width: 100%;
  margin-top: -20px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  background: ${(props) => props.theme === 'dark' ? 'black' : 'white'};
  box-shadow: 0 0 7px rgba(0,0,0,0.3);
  padding: 15px;
  font-size: 14px;
  z-index: 1;
`;
