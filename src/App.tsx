import * as React from 'react';

import { ScrollWheel } from 'components';
import {
  useSettings,
  AudioPlayerProvider,
  MusicKitProvider,
  SettingsProvider,
  SpotifySDKProvider,
} from 'hooks';
import WindowProvider from 'providers/WindowProvider';
import styled, { createGlobalStyle } from 'styled-components';
import { Screen, Unit } from 'utils/constants';

import { WindowManager } from './components';
import { DeviceTheme, getTheme } from './utils/themes';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

    html {
      background: transparent;
    }

   body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 16px;
      user-select: none;
      -webkit-touch-callout: none;
      background: transparent;

      @media (prefers-color-scheme: dark) {
        background: white;
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

const Shell = styled.div<{ deviceTheme: DeviceTheme }>`
  position: relative;
  height: 100vh;
  margin: auto;
  max-height: 36.5em;
  width: 370px;
  border-radius: 30px;
  box-shadow: inset 0 0 2.4em #555;
  background: ${({ deviceTheme }) => getTheme(deviceTheme).body.background};
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
  -webkit-user-select: none;
  -webkit-app-region: drag;

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
        <Ipod />
      </SettingsProvider>
    </Container>
  );
};

const Ipod = () => {
  const { deviceTheme } = useSettings();
  return (
    <Shell deviceTheme={deviceTheme}>
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
  );
};

export default App;
