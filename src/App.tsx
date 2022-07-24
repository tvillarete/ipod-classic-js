import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ScrollWheel } from 'components';
import {
  AudioPlayerProvider,
  MusicKitProvider,
  SettingsProvider,
  SpotifySDKProvider,
  useSettings,
} from 'hooks';
import WindowProvider from 'providers/WindowProvider';
import styled, { createGlobalStyle } from 'styled-components';
import { Screen, Unit } from 'utils/constants';

import { WindowManager } from './components';
import { DeviceThemeName, getTheme } from './utils/themes';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
      'Segoe UI Symbol';
    font-size: 16px;
    user-select: none;
    -webkit-touch-callout: none;

    @media (prefers-color-scheme: dark) {
      background: black;
    }
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Shell = styled.div<{ deviceTheme: DeviceThemeName }>`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 370px;
  max-height: 37em;
  margin: auto;
  border-radius: 30px;
  box-shadow: inset 0 0 2.4em #555;
  background: ${({ deviceTheme }) => getTheme(deviceTheme).body.background};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(50%, transparent), to(rgba(250, 250, 250, 0.3)));
  animation: descend 1.5s ease;
  overflow: hidden;

  @media (prefers-color-scheme: dark) {
    box-shadow: inset 0 0 2.4em black;
  }

  ${Screen.SM.MediaQuery} {
    animation: none;
    width: 100vw;
    max-height: unset;
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

const Sticker = styled.div<{ deviceTheme: DeviceThemeName }>`
  position: absolute;
  background: ${({ deviceTheme }) =>
    getTheme(deviceTheme).body.sticker1?.background};
  ${({ deviceTheme }) => getTheme(deviceTheme).body.sticker1?.styles ?? {}};
`;

const Sticker2 = styled.div<{ deviceTheme: DeviceThemeName }>`
  position: absolute;
  background: ${({ deviceTheme }) =>
    getTheme(deviceTheme).body.sticker2?.background};
  ${({ deviceTheme }) => getTheme(deviceTheme).body.sticker2?.styles ?? {}};
`;

const Sticker3 = styled.div<{ deviceTheme: DeviceThemeName }>`
  position: absolute;
  background: ${({ deviceTheme }) =>
    getTheme(deviceTheme).body.sticker3?.background};
  ${({ deviceTheme }) => getTheme(deviceTheme).body.sticker3?.styles ?? {}};
`;

const ScreenContainer = styled.div`
  position: relative;
  height: 260px;
  margin: ${Unit.LG} ${Unit.LG} 0;
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

  ${Screen.SM.MediaQuery} {
    margin: ${Unit.MD} ${Unit.MD} 0;
  }
`;

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <GlobalStyles />
        <SettingsProvider>
          <Ipod />
        </SettingsProvider>
      </Container>
    </QueryClientProvider>
  );
};

const Ipod = () => {
  const { deviceTheme } = useSettings();

  return (
    <Shell deviceTheme={deviceTheme}>
      <Sticker deviceTheme={deviceTheme} />
      <Sticker2 deviceTheme={deviceTheme} />
      <Sticker3 deviceTheme={deviceTheme} />
      <ScreenContainer>
        <WindowProvider>
          <SpotifySDKProvider>
            <MusicKitProvider>
              <AudioPlayerProvider>
                <WindowManager />
              </AudioPlayerProvider>
            </MusicKitProvider>
          </SpotifySDKProvider>
        </WindowProvider>
      </ScreenContainer>
      <ScrollWheel />
    </Shell>
  );
};

export default App;
