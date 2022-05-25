import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

const GlobalStyle = createGlobalStyle`
  ${normalize};

  body {
    font-size: 18px;
    font-family: 'Roboto', Arial, sans-serif;
    /** Disable eslastic scrolling on mobile */
    overflow: hidden;
    overscroll-behavior: none;
  }

  #game {
    width: 100vw;
    height: 100vh;
  }
`;

export default GlobalStyle;
