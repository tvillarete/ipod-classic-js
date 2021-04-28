import {
  createContext,
  memo,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import ViewOptions, { WINDOW_TYPE } from 'App/views';
import { useWindowService } from 'services/window';
import * as Utils from 'utils';
import * as SpotifyUtils from 'utils/spotify';

import useEffectOnce from './useEffectOnce';
import { useSettings } from './useSettings';

export interface SpotifySDKState {
  isMounted: boolean;
  spotifyPlayer: Spotify.SpotifyPlayer;
  accessToken?: string;
  deviceId?: string;
}

export const SpotifySDKContext = createContext<SpotifySDKState>({} as any);

export type SpotifySDKHook = SpotifySDKState & {
  signIn: () => void;
  signOut: () => void;
};

export const useSpotifySDK = (): SpotifySDKHook => {
  const {
    isSpotifyAuthorized,
    setIsSpotifyAuthorized,
    isAppleAuthorized,
    setService,
  } = useSettings();
  const { showWindow } = useWindowService();
  const state = useContext(SpotifySDKContext);

  /**
   * Open the Spotify OAuth login page. Once authenticated, the user will be
   * redirected back to the app.
   */
  const signIn = useCallback(() => {
    if (!state.isMounted) {
      showWindow({
        type: WINDOW_TYPE.POPUP,
        id: ViewOptions.spotifyNotSupportedPopup.id,
        title: ViewOptions.spotifyNotSupportedPopup.title,
        description:
          'Spotify sadly only supports web playback on Chrome (desktop)',
        listOptions: [
          {
            type: 'Action',
            label: 'Okay 😞',
            onSelect: () => {},
          },
        ],
      });
      return;
    }

    if (!isSpotifyAuthorized) {
      window.open(
        `http://tannerv.ddns.net:3001/${Utils.isDev() ? 'login_dev' : 'login'}`,
        '_self'
      );
    } else {
      setService('spotify');
    }
  }, [isSpotifyAuthorized, setService, showWindow, state.isMounted]);

  const signOut = useCallback(() => {
    state.spotifyPlayer.disconnect();
    setIsSpotifyAuthorized(false);

    SpotifyUtils.removeExistingTokens();

    // Change to apple music if available.
    if (isAppleAuthorized) {
      setService('apple');
    } else {
      setService(undefined);
    }
  }, [
    isAppleAuthorized,
    setIsSpotifyAuthorized,
    setService,
    state.spotifyPlayer,
  ]);

  return {
    ...state,
    signIn,
    signOut,
  };
};

interface Props {
  children: React.ReactNode;
}

export const SpotifySDKProvider = ({ children }: Props) => {
  const { setIsSpotifyAuthorized, setService } = useSettings();
  const [token, setToken] = useState<string>();
  const [deviceId, setDeviceId] = useState<string>();
  const spotifyPlayerRef = useRef<Spotify.SpotifyPlayer | undefined>();
  const [isMounted, setIsMounted] = useState(false);

  /** Fetch access tokens and, if successful, then set up the playback sdk. */
  const handleMount = useCallback(async () => {
    const { accessToken, refreshToken, isNew } = await SpotifyUtils.getTokens();
    setIsMounted(true);

    if (accessToken && refreshToken) {
      setToken(accessToken);

      const player = new window.Spotify.Player({
        name: 'iPod Classic',
        getOAuthToken: async (cb: (token: string) => void) => {
          const { storedAccessToken } = SpotifyUtils.getExistingTokens();

          if (!storedAccessToken) {
            console.error("ERROR: Didn't find stored access token");
            return;
          }

          cb(storedAccessToken);
        },
      });

      player.addListener('ready', ({ device_id }: any) => {
        console.log({ device_id });
        setDeviceId(device_id);
        setIsSpotifyAuthorized(true);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error(`Spotify authentication error: ${message}`);
        setIsSpotifyAuthorized(false);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error(message);
      });

      player.connect();

      spotifyPlayerRef.current = player;

      /** The user has just signed in; configure the app to use Spotify. */
      if (isNew) {
        setService('spotify');
      }
    }
  }, [setIsSpotifyAuthorized, setService]);

  useEffectOnce(() => {
    window.onSpotifyWebPlaybackSDKReady = handleMount;
  });

  return (
    <SpotifySDKContext.Provider
      value={{
        spotifyPlayer:
          spotifyPlayerRef.current ?? ({} as Spotify.SpotifyPlayer),
        accessToken: token,
        deviceId,
        isMounted,
      }}
    >
      {children}
    </SpotifySDKContext.Provider>
  );
};

export default memo(SpotifySDKProvider);
