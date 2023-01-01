import { memo } from 'react';
import WindowProvider from 'providers/WindowProvider';
import { ScrollWheel } from 'components';
import {
  AudioPlayerProvider,
  MusicKitProvider,
  SpotifySDKProvider,
  useSettings,
} from 'hooks';
import { WindowManager } from 'components';
import {
  ScreenContainer,
  Shell,
  Sticker,
  Sticker2,
  Sticker3,
} from 'components/Ipod/Styled';

type Props = {
  appleAccessToken: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
};

const Ipod = ({
  appleAccessToken,
  spotifyAccessToken,
  spotifyRefreshToken,
}: Props) => {
  const { deviceTheme } = useSettings();

  return (
    <Shell deviceTheme={deviceTheme}>
      <Sticker deviceTheme={deviceTheme} />
      <Sticker2 deviceTheme={deviceTheme} />
      <Sticker3 deviceTheme={deviceTheme} />
      <ScreenContainer>
        <WindowProvider>
          <SpotifySDKProvider
            initialAccessToken={spotifyAccessToken}
            refreshToken={spotifyRefreshToken}
          >
            <MusicKitProvider token={appleAccessToken}>
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

export default memo(Ipod);
