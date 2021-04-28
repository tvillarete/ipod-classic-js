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

import { useSettings } from './useSettings';

/**
 * This will be used to connect to the Apple Music API.
 * @see https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEVELOPER_TOKEN: string | undefined =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJHWFFEWThYM0MifQ.eyJpYXQiOjE2MTY4ODQ1MDksImV4cCI6MTYzMjQzNjUwOSwiaXNzIjoiRzZIM0NLV005QyJ9.z7NS-8962oumCEaYOUMJfzonO2Y2tAWb_vAF_wwOkDqU8BoWTo6xDg5uG8ZvFeFpMqRoMbBaB_Mr4sxpvJzjPg';

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
  const {
    setIsAppleAuthorized,
    isSpotifyAuthorized,
    setService,
  } = useSettings();
  const { isConfigured, hasDevToken } = useContext(MusicKitContext);
  const music = useMemo(() => {
    if (!isConfigured || !hasDevToken) {
      return {} as MusicKit.MusicKitInstance;
    }

    return window.MusicKit.getInstance();
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
    setIsAppleAuthorized,
    setService: setStreamingService,
  } = useSettings();

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
        setIsAppleAuthorized(true);
      }
    } catch (e) {
      setHasDevToken(false);
    }
  }, [musicKit, setIsAppleAuthorized]);

  useMKEventListener('userTokenDidChange', (e) => {
    if (e.userToken) {
      setIsAppleAuthorized(true);
      setStreamingService('apple');
    } else {
      setIsAppleAuthorized(false);
      setStreamingService(undefined);
    }
  });

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured, hasDevToken }}>
      {isConfigured ? children : null}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
