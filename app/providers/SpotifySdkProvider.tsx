import { getCookie, setCookie } from "cookies-next";
import { useViewContext, useSettings, useInterval, useEffectOnce } from "hooks";
import { useState, useRef, useCallback, useEffect, createContext } from "react";
import * as SpotifyUtils from "utils/spotify";
import { SPOTIFY_TOKENS_COOKIE_NAME } from "utils/constants/api";
import views from "components/views";

export interface SpotifySDKState {
  isPlayerConnected: boolean;
  isSdkReady: boolean;
  spotifyPlayer: Spotify.Player;
  accessToken?: string;
  refreshToken?: string;
  deviceId?: string;
}

export const SpotifySDKContext = createContext<SpotifySDKState>({} as any);
interface Props {
  children: React.ReactNode;
}

export const SpotifySDKProvider = ({ children }: Props) => {
  const { showView, hideView } = useViewContext();
  const { setIsSpotifyAuthorized } = useSettings();
  const [deviceId, setDeviceId] = useState<string>();
  const spotifyPlayerRef = useRef<Spotify.Player | undefined>();
  const [isPlayerConnected, setIsPlayerConnected] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  const [storedAccessToken, storedRefreshToken, tokenLastRefreshedTimestamp] =
    getCookie(SPOTIFY_TOKENS_COOKIE_NAME)?.split(",") ?? [
      undefined,
      undefined,
      undefined,
    ];

  const [accessToken, setAccessToken] = useState<string | undefined>(
    storedAccessToken
  );

  const handleUnsupportedAccountError = useCallback(() => {
    showView({
      type: "popup",
      id: views.spotifyNonPremiumPopup.id,
      title: "Unable to sign in",
      description:
        "Spotify requires a Premium account to play music on the web",
      listOptions: [
        {
          type: "action",
          label: "Okay 😞",
          onSelect: hideView,
        },
      ],
    });
  }, [hideView, showView]);

  /** Fetch access tokens and, if successful, then set up the playback sdk. */
  const handleConnectToSpotify = useCallback(async () => {
    setIsPlayerConnected(true);

    if (accessToken) {
      const player = new window.Spotify.Player({
        name: "iPod.js",
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
    if (!storedRefreshToken) {
      console.log("No refresh token found");
      return;
    }

    console.log("Refreshing access token");

    const {
      accessToken: updatedAccessToken,
      refreshToken: updatedRefreshToken,
    } = await SpotifyUtils.getRefreshedSpotifyTokens(storedRefreshToken);

    console.log(`Refreshed access token: ${updatedAccessToken}`);

    if (updatedAccessToken && updatedRefreshToken) {
      const tokenRefreshTimestamp = Date.now().toString();
      setCookie(
        SPOTIFY_TOKENS_COOKIE_NAME,
        `${updatedAccessToken},${updatedRefreshToken},${tokenRefreshTimestamp}`
      );
    }
    setAccessToken(updatedAccessToken);
  }, [storedRefreshToken]);

  // Refresh the access token every 55 minutes.
  useInterval(handleRefreshTokens, 3300000, !accessToken);

  useEffect(() => {
    if (isSdkReady && typeof accessToken === "string" && !isPlayerConnected) {
      handleConnectToSpotify();
    }
  }, [handleConnectToSpotify, isSdkReady, accessToken, isPlayerConnected]);

  const handleMount = useCallback(async () => {
    const timestamp = Number(tokenLastRefreshedTimestamp);
    if (SpotifyUtils.checkShouldRefreshSpotifyTokens(timestamp)) {
      await handleRefreshTokens();
    }

    setIsSdkReady(true);
  }, [handleRefreshTokens, tokenLastRefreshedTimestamp]);

  useEffectOnce(() => {
    if (window.Spotify) {
      handleMount();
    } else {
      window.onSpotifyWebPlaybackSDKReady = handleMount;
    }
  });

  return (
    <SpotifySDKContext.Provider
      value={{
        spotifyPlayer: spotifyPlayerRef.current ?? ({} as Spotify.Player),
        accessToken,
        deviceId,
        isPlayerConnected,
        isSdkReady,
      }}
    >
      {children}
    </SpotifySDKContext.Provider>
  );
};
