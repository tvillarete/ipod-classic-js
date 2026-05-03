import { useCallback, useContext, useEffect, useRef } from "react";

import { useViewContext } from "@/hooks";
import * as SpotifyUtils from "@/utils/spotify";

import { useSettings } from "..";
import {
  SpotifySDKContext,
  SpotifySDKState,
} from "@/providers/SpotifySdkProvider";

export type SpotifySDKHook = SpotifySDKState & {
  signIn: () => void;
  signOut: () => void;
};

export type SpotifySDKHookProps = {
  onAuthorizationChanged?: (isAuthorized: boolean) => void;
};

export const useSpotifySDK = ({
  onAuthorizationChanged,
}: SpotifySDKHookProps = {}): SpotifySDKHook => {
  const {
    isSpotifyAuthorized,
    setIsSpotifyAuthorized,
    isAppleAuthorized,
    setService,
  } = useSettings();
  const { showPopup } = useViewContext();
  const state = useContext(SpotifySDKContext);

  if (!state) {
    throw new Error("useSpotifySDK must be used within SpotifySDKProvider");
  }

  const authorizationChangedRef = useRef(onAuthorizationChanged);

  useEffect(() => {
    authorizationChangedRef.current = onAuthorizationChanged;
  }, [onAuthorizationChanged]);

  useEffect(() => {
    authorizationChangedRef.current?.(isSpotifyAuthorized);
  }, [isSpotifyAuthorized]);

  /**
   * Open the Spotify OAuth login page. Once authenticated, the user will be
   * redirected back to the app.
   */
  const signIn = useCallback(async () => {
    if (!isSpotifyAuthorized) {
      window.location.href = `/ipod/api/spotify/login`;
    } else if (!state.isPlayerConnected) {
      showPopup({
        id: "spotifyNotSupported",
        title: "Spotify Not Supported",
        description: "Spotify was unable to mount on this browser :(",
        listOptions: [
          {
            type: "action",
            label: "Okay 😞",
            onSelect: () => {},
          },
        ],
      });
    } else {
      setService("spotify");
    }
  }, [isSpotifyAuthorized, setService, showPopup, state.isPlayerConnected]);

  const signOut = useCallback(async () => {
    state.spotifyPlayer?.removeListener("playback_error");
    state.spotifyPlayer?.disconnect();
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
