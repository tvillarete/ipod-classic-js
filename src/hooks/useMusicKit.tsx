import {
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
  hasDevToken: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export interface MusicKitHook {
  isConfigured: boolean;
  isAuthorized: boolean;
  hasDevToken: boolean;
  musicKit: typeof MusicKit;
  music: MusicKit.MusicKitInstance;
}

export const useMusicKit = (): MusicKitHook => {
  const musicKit = window.MusicKit;
  const { isConfigured, isAuthorized, hasDevToken } = useContext(
    MusicKitContext
  );
  const music = useMemo(() => {
    if (!isConfigured || !hasDevToken) {
      return {} as any;
    }

    return window.MusicKit.getInstance();
  }, [hasDevToken, isConfigured]);

  return {
    isConfigured,
    isAuthorized,
    hasDevToken,
    musicKit,
    music,
  };
};

interface Props {
  children: React.ReactNode;
}

export const MusicKitProvider = ({ children }: Props) => {
  const musicKit = window.MusicKit;
  const [hasDevToken, setHasDevToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  useEffect(() => {
    try {
      const music = musicKit.configure({
        developerToken:
          DEVELOPER_TOKEN ??
          new URLSearchParams(window.location.search).get('token') ??
          undefined,
        app: {
          name: 'iPod.js',
          build: '1.0',
        },
      });

      if (music) {
        setHasDevToken(true);
      }

      if (music.isAuthorized) {
        setIsAuthorized(true);
      }
    } catch (e) {
      setHasDevToken(false);
    }
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
    <MusicKitContext.Provider
      value={{ musicKit, isConfigured, isAuthorized, hasDevToken }}
    >
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
