import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useEventListener, useMKEventListener, useSettings } from 'hooks';

/**
 * This will be used to connect to the Apple Music API.
 * @see https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEVELOPER_TOKEN: string | undefined =
  process.env.REACT_APP_APPLE_DEV_TOKEN;

export interface MusicKitState {
  musicKit: typeof MusicKit;
  isConfigured: boolean;
  hasDevToken: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export type MusicKitHook = MusicKitState & {
  music: MusicKit.MusicKitInstance;
  signIn: () => Promise<void>;
  signOut: () => void;
};

export const useMusicKit = (): MusicKitHook => {
  const musicKit = window.MusicKit;
  const { setIsAppleAuthorized, isSpotifyAuthorized, setService } =
    useSettings();
  const { isConfigured, hasDevToken } = useContext(MusicKitContext);

  const music = useMemo(() => {
    if (!isConfigured || !hasDevToken) {
      return {} as MusicKit.MusicKitInstance;
    }

    return window.MusicKit?.getInstance();
  }, [hasDevToken, isConfigured]);

  const signIn = useCallback(async () => {
    if (!music.isAuthorized) {
      await music.authorize();
    }

    setService('apple');
  }, [music, setService]);

  const signOut = useCallback(() => {
    music.unauthorize();
    setIsAppleAuthorized(false);

    // Change to Spotify if available.
    setService(isSpotifyAuthorized ? 'spotify' : undefined);
  }, [isSpotifyAuthorized, music, setIsAppleAuthorized, setService]);

  return {
    isConfigured,
    hasDevToken,
    musicKit,
    music,
    signIn,
    signOut,
  };
};

interface Props {
  children: React.ReactNode;
}

export const MusicKitProvider = ({ children }: Props) => {
  const musicKit = window.MusicKit;
  const [hasDevToken, setHasDevToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const {
    isSpotifyAuthorized,
    setIsAppleAuthorized,
    setService: setStreamingService,
  } = useSettings();

  const handleConfigure = useCallback(async () => {
    try {
      const music = await musicKit.configure({
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
        setIsAppleAuthorized(true);
      }
    } catch (e) {
      setHasDevToken(false);
    }
  }, [musicKit, setIsAppleAuthorized]);

  useEffect(() => {
    if (!isConfigured) {
      handleConfigure();
    }
  }, [handleConfigure, isConfigured]);

  useMKEventListener('userTokenDidChange', (e) => {
    if (e.userToken) {
      setIsAppleAuthorized(true);
      setStreamingService('apple');
    } else {
      setIsAppleAuthorized(false);
      setStreamingService(isSpotifyAuthorized ? 'spotify' : undefined);
    }
  });

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured, hasDevToken }}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
