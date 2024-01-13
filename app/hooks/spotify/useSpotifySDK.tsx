import { useCallback, useContext, useEffect, useRef } from "react";

import { useViewContext } from "hooks";
import * as SpotifyUtils from "utils/spotify";

import { useSettings } from "..";
import { API_URL } from "utils/constants/api";
import {
  SpotifySDKContext,
  SpotifySDKState,
} from "providers/SpotifySdkProvider";
import views from "components/views";

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
  const { showView } = useViewContext();
  const state = useContext(SpotifySDKContext);

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
      // Generate the Spotify OAuth login URL with the client ID, state, scope, and redirect URI.
      const res = await fetch(`${API_URL}/spotify/login`);
      const spotifyLoginUrl = (await res.json()).message;

      window.open(spotifyLoginUrl, "_self");
    } else if (!state.isPlayerConnected) {
      showView({
        type: "popup",
        id: views.spotifyNotSupportedPopup.id,
        title: views.spotifyNotSupportedPopup.title,
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
  }, [isSpotifyAuthorized, setService, showView, state.isPlayerConnected]);

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
