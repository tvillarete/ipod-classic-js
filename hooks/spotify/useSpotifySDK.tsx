import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import ViewOptions, { WINDOW_TYPE } from "components/views";
import { useInterval, useWindowContext } from "hooks";
import * as SpotifyUtils from "utils/spotify";

import { useSettings } from "..";

export interface SpotifySDKState {
  isPlayerConnected: boolean;
  spotifyPlayer: Spotify.Player;
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
  const { showWindow } = useWindowContext();
  const state = useContext(SpotifySDKContext);

  /**
   * Open the Spotify OAuth login page. Once authenticated, the user will be
   * redirected back to the app.
   */
  const signIn = useCallback(() => {
    if (!isSpotifyAuthorized) {
      window.open(`/api/spotify/login`, "_self");
    } else if (!state.isPlayerConnected) {
      showWindow({
        type: WINDOW_TYPE.POPUP,
        id: ViewOptions.spotifyNotSupportedPopup.id,
        title: ViewOptions.spotifyNotSupportedPopup.title,
        description: "Spotify was unable to mount on this browser :(",
        listOptions: [
          {
            type: "Action",
            label: "Okay 😞",
            onSelect: () => {},
          },
        ],
      });
    } else {
      setService("spotify");
    }
  }, [isSpotifyAuthorized, setService, showWindow, state.isPlayerConnected]);

  const signOut = useCallback(async () => {
    state.spotifyPlayer.disconnect();
    setIsSpotifyAuthorized(false);

    await SpotifyUtils.logOutSpotify();

    // Change to apple music if available.
    if (isAppleAuthorized) {
      setService("apple");
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
  initialAccessToken?: string;
  refreshToken?: string;
}

export const SpotifySDKProvider = ({
  children,
  initialAccessToken,
  refreshToken,
}: Props) => {
  const { showWindow, hideWindow } = useWindowContext();
  const { setIsSpotifyAuthorized, setService } = useSettings();
  const [deviceId, setDeviceId] = useState<string>();
  const spotifyPlayerRef = useRef<Spotify.Player | undefined>();
  const [isPlayerConnected, setIsMounted] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(
    initialAccessToken
  );

  const handleUnsupportedAccountError = useCallback(() => {
    showWindow({
      type: WINDOW_TYPE.POPUP,
      id: ViewOptions.spotifyNonPremiumPopup.id,
      title: "Unable to sign in",
      description:
        "Spotify requires a Premium account to play music on the web",
      listOptions: [
        {
          type: "Action",
          label: "Okay 😞",
          onSelect: hideWindow,
        },
      ],
    });
  }, [hideWindow, showWindow]);

  /** Fetch access tokens and, if successful, then set up the playback sdk. */
  const handleConnectToSpotify = useCallback(async () => {
    setIsMounted(true);

    if (accessToken) {
      const player = new window.Spotify.Player({
        name: "iPod Classic",
        getOAuthToken: async (cb) => {
          if (!accessToken) {
            console.error(
              "handleConnectToSpotify: Access token was not provided"
            );
            return;
          }

          cb(accessToken);
        },
      });

      player.addListener("ready", ({ device_id }: any) => {
        console.log(`Spotify Player is connected with ID: ${device_id}`);
        setDeviceId(device_id);
        setIsSpotifyAuthorized(true);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error(`Spotify authentication error: ${message}`);
        setIsSpotifyAuthorized(false);
      });

      /** This indicates that the user is using an unsupported account tier. */
      player.addListener("account_error", () => {
        handleUnsupportedAccountError();
        setIsSpotifyAuthorized(false);

        SpotifyUtils.logOutSpotify();
      });

      player.addListener("playback_error", ({ message }) => {
        console.error(message);
      });

      player.connect();

      spotifyPlayerRef.current = player;
    }
  }, [handleUnsupportedAccountError, setIsSpotifyAuthorized, accessToken]);

  const handleRefreshTokens = useCallback(async () => {
    const { accessToken: updatedAccessToken } =
      await SpotifyUtils.getRefreshedSpotifyTokens(refreshToken);

    console.log(`Refreshed access token: ${updatedAccessToken}`);

    setAccessToken(updatedAccessToken);
  }, [refreshToken]);

  // Refresh the access token every 55 minutes.
  useInterval(handleRefreshTokens, 3500000, !accessToken);

  useEffect(() => {
    if (isSdkReady && typeof accessToken === "string" && !isPlayerConnected) {
      handleConnectToSpotify();
    }
  }, [handleConnectToSpotify, isSdkReady, accessToken, isPlayerConnected]);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => setIsSdkReady(true);
  }, []);

  return (
    <SpotifySDKContext.Provider
      value={{
        spotifyPlayer: spotifyPlayerRef.current ?? ({} as Spotify.Player),
        accessToken,
        deviceId,
        isPlayerConnected,
      }}
    >
      {children}
    </SpotifySDKContext.Provider>
  );
};

export default memo(SpotifySDKProvider);
