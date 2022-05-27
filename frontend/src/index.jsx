import { render } from 'preact';
import { Main } from './components/main.jsx';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    box-sizing: border-box;
    margin: 0;
  }
`;

const Root = () => {
  return (
    <>
      <GlobalStyle />
      <Main />
    </>
  );
}

render(<Root />, document.body);
