import {createContext} from 'preact';
import {useState} from 'preact/hooks';
import {createGlobalStyle} from 'styled-components';

const browserPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const browserTheme = browserPrefersDark ? 'dark' : 'light';
export const ThemeContext = createContext(browserTheme);

const GlobalStyle = createGlobalStyle`
  html {
    ${(props) => props.theme === 'dark' && 'background-color: #111;'}
    ${(props) => props.theme === 'dark' && 'color: #eee;'}
  }

  ::placeholder {
    ${(props) => props.theme === 'dark' && 'color: #eee;'}
  }

  a:visited {
    ${(props) => props.theme === 'dark' && 'color: #bdb4ff;'}
  }
`;

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || browserTheme);

  const onThemeChange = (value) => {
    localStorage.setItem('theme', value);
    setTheme(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: onThemeChange }}>
      <GlobalStyle theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
};
