import { createGlobalStyle } from "styled-components";
import { Screen } from "utils/constants";

export const GlobalStyles = createGlobalStyle`
  body {
    height: 100dvh;
    display: grid;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    color: black;
    min-height: 550px;
    overflow: auto;

    ${Screen.XS.MediaQuery} {
      min-height: 480px;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }

  @media (prefers-color-scheme: dark) {
    html {
      color-scheme: dark;
    }
    body {
      background: black;
    }
  }
`;
