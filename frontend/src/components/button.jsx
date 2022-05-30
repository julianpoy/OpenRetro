import styled from 'styled-components';

export const Button = styled.button`
  background-color: #3880ff;

  border-radius: 5px;
  padding: 10px;
  margin: 0.25em;
  color: white;

  border: none;

  box-shadow: 1px 1px 6px rgba(0,0,0,0.2);

  cursor: pointer;

  &:disabled {
    background-color: #81abf5;
  }
`;

export const ClearButton = styled.button`
  background-color: transparent;

  padding: 0;
  margin: 0.25em;
  color: #3880ff;

  border: none;

  cursor: pointer;

  &:disabled {
    background-color: #81abf5;
  }
`;

export const IconButton = styled(ClearButton)`
  font-size: 16px;
`
