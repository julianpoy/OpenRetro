import styled from 'styled-components';

export const GridContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
`;

export const GridColumn = styled.div`
  min-height: 400px;
  text-align: center;
  outline: ${(props) => props.dropEffect ? '1px dashed #3498db' : 'none'};
`;

export const GridColumnTitle = styled.div`
  font-weight: bold;
`;

export const GridGroup = styled.div`
  outline: ${(props) => props.dropEffect ? '1px dashed #3498db' : 'none'};
  padding: 5px;
  ${(props) => props.width ? `width: ${props.width}px;` : ``}
  border-radius: 5px;
  margin: 5px;

  ${(props) => props.backdrop && `
    background: ${props.theme === 'dark' ? '#203142' : 'rgba(0,0,0,0.1)'};
    margin: 10px;
  `}
`;

export const GridCard = styled.div`
  position: relative;
  border-radius: 5px;
  background: ${(props) => props.color};
  color: ${(props) => props.invisible ? 'transparent' : 'black'};
  font-size: 14px;
  padding: 10px 20px;
  margin: 1px;
  cursor: pointer;
  ${(props) => props.theme === 'dark' && 'opacity: 0.9;'}
`;

