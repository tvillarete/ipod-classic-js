import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useEventListener, useMKEventListener } from 'hooks';

/**
 * This will be used to connect to the Apple Music API.
 * @see https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEVELOPER_TOKEN: string | undefined = undefined;

export interface MusicKitState {
  musicKit: typeof MusicKit;
  isConfigured: boolean;
  isAuthorized: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export interface MusicKitHook {
  isConfigured: boolean;
  isAuthorized: boolean;
  musicKit: typeof MusicKit;
  music: MusicKit.MusicKitInstance;
}

export const useMusicKit = (): MusicKitHook => {
  const musicKit = window.MusicKit;
  const { isConfigured, isAuthorized } = useContext(MusicKitContext);
  const music = useMemo(() => {
    if (!isConfigured) {
      return {} as any;
    }

    return window.MusicKit.getInstance();
  }, [isConfigured]);

  return {
    isConfigured,
    isAuthorized,
    musicKit,
    music,
  };
};

interface Props {
  children: React.ReactNode;
}

export const MusicKitProvider = ({ children }: Props) => {
  const musicKit = window.MusicKit;
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  console.log({ token: process.env.DEVELOPER_TOKEN });

  useEffect(() => {
    console.log({ musicKit });
    musicKit.configure({
      developerToken:
        DEVELOPER_TOKEN ??
        new URLSearchParams(window.location.search).get('token') ??
        undefined,
      app: {
        name: 'My Cool Web App',
        build: '1978.4.1',
      },
    });
    if (musicKit.getInstance().isAuthorized) {
      setIsAuthorized(true);
    }
  }, [musicKit]);

  const handlePlayPauseClick = useCallback(() => {
    const music = musicKit.getInstance();

    if (music.player.isPlaying) {
      music.pause();
    } else {
      music.play();
    }
  }, [musicKit]);

  const handleForwardClick = useCallback(() => {
    const music = musicKit.getInstance();

    music.skipToNextItem();
  }, [musicKit]);

  const handleBackClick = useCallback(() => {
    const music = musicKit.getInstance();

    music.skipToPreviousItem();
  }, [musicKit]);

  useMKEventListener('userTokenDidChange', (e) => {
    setIsAuthorized(!!e.userToken);
  });

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });
  useEventListener('playpauseclick', handlePlayPauseClick);
  useEventListener('forwardclick', handleForwardClick);
  useEventListener('backclick', handleBackClick);

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured, isAuthorized }}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
