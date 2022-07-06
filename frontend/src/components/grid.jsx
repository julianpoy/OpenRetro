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
  margin: 3px;

  ${(props) => props.backdrop && `
    background: ${props.theme === 'dark' ? '#203142' : 'rgba(0,0,0,0.1)'};
    margin: 10px;
  `}
`;

export const GridCard = styled.div`
  position: relative;
  color: ${(props) => props.invisible ? 'transparent' : 'black'};
  font-size: 14px;
  margin: 0;
  cursor: pointer;
  ${(props) => props.theme === 'dark' && 'opacity: 0.9;'}
  border-top: 1px solid transparent;
  ${(props) => props.showDropBeforeBorder && 'border-top: 1px dashed blue;'}
  border-bottom: 1px solid transparent;
  ${(props) => props.showDropAfterBorder && 'border-bottom: 1px dashed blue;'}
  background-clip: padding-box;
`;

export const GridCardContent = styled.div`
  border-radius: 5px;
  padding: 10px 20px;
  background: ${(props) => props.color};
`;

