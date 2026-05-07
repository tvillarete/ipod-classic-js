import {
  useViewContext,
  useSettings,
  useInterval,
  useEffectOnce,
} from "@/hooks";
import { useState, useRef, useCallback, useEffect, createContext, useMemo } from "react";
import * as SpotifyUtils from "@/utils/spotify";
import { SPOTIFY_TOKENS_COOKIE_NAME } from "@/utils/constants/api";

export interface SpotifySDKState {
  isPlayerConnected: boolean;
  isSdkReady: boolean;
  spotifyPlayer?: Spotify.Player;
  accessToken?: string;
  deviceId?: string;
  hasError: boolean;
  refreshAccessToken: () => Promise<string | undefined>;
}

export const SpotifySDKContext = createContext<SpotifySDKState | undefined>(
  undefined
);
interface Props {
  children: React.ReactNode;
}

const getClientCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const SpotifySDKProvider = ({ children }: Props) => {
  const { showPopup, hideView } = useViewContext();
  const { setIsSpotifyAuthorized } = useSettings();
  const [deviceId, setDeviceId] = useState<string>();
  const spotifyPlayerRef = useRef<Spotify.Player | undefined>(undefined);
  const [isPlayerConnected, setIsPlayerConnected] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { storedAccessToken, tokenLastRefreshedTimestamp } = useMemo(() => {
    try {
      const cookieValue = getClientCookie(SPOTIFY_TOKENS_COOKIE_NAME);
      if (!cookieValue) return {};
      const parsed = JSON.parse(cookieValue);
      return {
        storedAccessToken: parsed.accessToken as string | undefined,
        tokenLastRefreshedTimestamp: parsed.lastRefreshedTimestamp?.toString() as string | undefined,
      };
    } catch {
      return {};
    }
  }, []);

  const [accessToken, setAccessToken] = useState<string | undefined>(
    storedAccessToken
  );

  // Keep a ref so the Spotify SDK's getOAuthToken callback always reads the latest token
  const accessTokenRef = useRef<string | undefined>(storedAccessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const handleUnsupportedAccountError = useCallback(() => {
    showPopup({
      id: "spotifyNonPremium",
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
  }, [hideView, showPopup]);

  /** Fetch access tokens and, if successful, then set up the playback sdk. */
  const handleConnectToSpotify = useCallback(async () => {
    setHasError(false);

    if (accessToken) {
      try {
        const player = new window.Spotify.Player({
          name: "iPod.js",
          getOAuthToken: async (cb) => {
            const token = accessTokenRef.current;
            if (!token) {
              console.error(
                "handleConnectToSpotify: Access token was not provided"
              );
              return;
            }

            cb(token);
          },
        });

        player.addListener("ready", ({ device_id }: any) => {
          setDeviceId(device_id);
          setIsSpotifyAuthorized(true);
          setIsPlayerConnected(true);
        });

        player.addListener("authentication_error", ({ message }) => {
          console.error(`Spotify authentication error: ${message}`);
          setIsSpotifyAuthorized(false);
          setHasError(true);
        });

        /** This indicates that the user is using an unsupported account tier. */
        player.addListener("account_error", () => {
          handleUnsupportedAccountError();
          setIsSpotifyAuthorized(false);
          setHasError(true);

          SpotifyUtils.logOutSpotify();
        });

        player.addListener("playback_error", ({ message }) => {
          console.warn("Spotify playback error:", message);
        });

        player.connect();

        spotifyPlayerRef.current = player;
      } catch (e) {
        console.error("Spotify player initialization error:", e);
        setHasError(true);
      }
    }
  }, [handleUnsupportedAccountError, setIsSpotifyAuthorized]);

  const handleRefreshTokens = useCallback(async (): Promise<
    string | undefined
  > => {
    try {
      const { accessToken: updatedAccessToken } =
        await SpotifyUtils.getRefreshedSpotifyTokens();

      if (updatedAccessToken) {
        setAccessToken(updatedAccessToken);
      }
      return updatedAccessToken;
    } catch (error) {
      console.error("Failed to refresh Spotify tokens:", error);
      setHasError(true);
      return undefined;
    }
  }, []);

  // Refresh the access token every 55 minutes.
  useInterval(handleRefreshTokens, 3300000, !accessToken);

  useEffect(() => {
    if (isSdkReady && typeof accessToken === "string" && !isPlayerConnected) {
      handleConnectToSpotify();
    }
  }, [handleConnectToSpotify, isSdkReady, accessToken, isPlayerConnected]);

  const handleMount = useCallback(async () => {
    if (storedAccessToken) {
      const timestamp = Number(tokenLastRefreshedTimestamp);
      if (SpotifyUtils.checkShouldRefreshSpotifyTokens(timestamp)) {
        await handleRefreshTokens();
      }
    }

    setIsSdkReady(true);
  }, [handleRefreshTokens, storedAccessToken, tokenLastRefreshedTimestamp]);

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
        spotifyPlayer: spotifyPlayerRef.current,
        accessToken,
        deviceId,
        isPlayerConnected,
        isSdkReady,
        hasError,
        refreshAccessToken: handleRefreshTokens,
      }}
    >
      {children}
    </SpotifySDKContext.Provider>
  );
};
