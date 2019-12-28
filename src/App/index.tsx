import React from 'react';

import { Screen, ScrollWheel } from 'components';
import AudioProvider from 'services/audio';
import WindowProvider from 'services/window';
import styled, { createGlobalStyle } from 'styled-components';

import Audio from './Audio';
import Interface from './Interface';

const GlobalStyles = createGlobalStyle`
   body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 16px;
      box-sizing: border-box;

      @media (prefers-color-scheme: dark) {
        background: black;
      }
   }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Shell = styled.div`
  position: relative;
  height: 100vh;
  max-height: 36.5em;
  width: 370px;
  border-radius: 30px;
  border: 1px solid gray;
  box-shadow: inset 0 0 2.4em #555;
  background: rgb(225, 225, 225);
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(50%, transparent), to(rgba(250, 250, 250, 0.3)));

  ${Screen.SM} {
    @media screen and (max-height: 750px) {
      border-radius: 0;
      -webkit-box-reflect: unset;
    }
  }
`;

const App: React.FC = () => {
  return (
    <Container>
      <GlobalStyles />
      <AudioProvider>
        <WindowProvider>
          <Shell>
            <Interface />
            <ScrollWheel />
            <Audio />
          </Shell>
        </WindowProvider>
      </AudioProvider>
    </Container>
  );
};

export default App;
