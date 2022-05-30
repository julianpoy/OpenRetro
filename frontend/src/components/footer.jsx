import { useState, useContext } from 'preact/hooks';

import styled from 'styled-components';
import {ThemeContext} from '../contexts/theme.jsx';

const Container = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

export const Footer = () => {
  const themeContext = useContext(ThemeContext);

  const isDarkMode = themeContext.theme === 'dark';

  const onThemeChange = (event) => {
    const theme = !!event.target.checked ? 'dark' : 'light';
    themeContext.setTheme(theme);
  };

  return (
    <Container>
      <label>
        <input type="checkbox" checked={isDarkMode} onChange={onThemeChange} />
        Dark Mode
      </label>
    </Container>
  );
};
