import * as React from 'react';

import { ScrollWheel } from 'components';
import {
  AudioPlayerProvider,
  MusicKitProvider,
  SettingsProvider,
  SpotifySDKProvider,
} from 'hooks';
import WindowProvider from 'providers/WindowProvider';
import styled, { createGlobalStyle } from 'styled-components';
import { Screen, Unit } from 'utils/constants';

import { WindowManager } from './components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

   body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 16px;
      user-select: none;
      -webkit-touch-callout: none;

      @media (prefers-color-scheme: dark) {
        background: black;
      }
   }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media screen and (min-width: 750px) {
    height: 100vh;
    display: flex;
  }
`;

const Shell = styled.div`
  position: relative;
  height: 100vh;
  margin: auto;
  max-height: 36.5em;
  width: 370px;
  border-radius: 30px;
  box-shadow: inset 0 0 2.4em #555;
  background: linear-gradient(180deg, #e3e3e3 0%, #d6d6d6 100%);
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(50%, transparent), to(rgba(250, 250, 250, 0.3)));
  animation: descend 1.5s ease;

  @media (prefers-color-scheme: dark) {
    box-shadow: inset 0 0 2.4em black;
  }

  @media screen and (max-width: 400px) {
    animation: none;
    border-radius: 0;
    -webkit-box-reflect: unset;
  }

  @keyframes descend {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ScreenContainer = styled.div`
  position: relative;
  height: 260px;
  margin: ${Unit.LG} ${Unit.LG} ${Unit.XL};
  border: 4px solid black;
  border-radius: ${Unit.XS};
  overflow: hidden;
  background: white;
  animation: fadeFromBlack 0.5s;

  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }

  ${Screen.SM} {
    @media screen and (max-height: 750px) {
      margin: ${Unit.SM} ${Unit.SM} ${Unit.XL};
    }
  }
`;

const App: React.FC = () => {
  return (
    <Container>
      <GlobalStyles />
      <SettingsProvider>
        <Shell>
          <ScreenContainer>
            <SpotifySDKProvider>
              <MusicKitProvider>
                <AudioPlayerProvider>
                  <WindowProvider>
                    <WindowManager />
                  </WindowProvider>
                </AudioPlayerProvider>
              </MusicKitProvider>
            </SpotifySDKProvider>
          </ScreenContainer>
          <ScrollWheel />
        </Shell>
      </SettingsProvider>
    </Container>
  );
};

export default App;
