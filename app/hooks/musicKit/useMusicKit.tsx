import { createContext, useCallback, useContext } from "react";

import { useSettings, useViewContext } from "hooks";
import views from "components/views";

export interface MusicKitState {
  musicKit?: typeof MusicKit;
  isConfigured: boolean;
  hasDevToken: boolean;
  hasError: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export type MusicKitHook = MusicKitState & {
  music: MusicKit.MusicKitInstance;
  signIn: () => Promise<void>;
  signOut: () => void;
};

export const useMusicKit = (): MusicKitHook => {
  const { setIsAppleAuthorized, isSpotifyAuthorized, setService } =
    useSettings();
  const { isConfigured, hasDevToken, hasError } = useContext(MusicKitContext);
  const { showView } = useViewContext();

  const signIn = useCallback(async () => {
    const music = window.MusicKit?.getInstance();

    if (hasError) {
      showView({
        type: "popup",
        id: views.musicProviderErrorPopup.id,
        title: views.musicProviderErrorPopup.title,
        description:
          "Apple Music was unable to mount. Try reloading or feel free to file bug report 🐞",
        listOptions: [
          {
            type: "action",
            label: "Reload",
            onSelect: () => window.location.reload(),
          },
          {
            type: "action",
            label: "Done",
            onSelect: () => {},
          },
        ],
      });
    }

    if (music?.isAuthorized === false) {
      await music?.authorize();
    }

    setService("apple");
  }, [hasError, setService, showView]);

  const signOut = useCallback(() => {
    const music = window.MusicKit?.getInstance();
    music?.unauthorize();
    setIsAppleAuthorized(false);

    // Change to Spotify if available.
    setService(isSpotifyAuthorized ? "spotify" : undefined);
  }, [isSpotifyAuthorized, setIsAppleAuthorized, setService]);

  return {
    isConfigured,
    hasDevToken,
    hasError,
    musicKit: window.MusicKit,
    music: window.MusicKit?.getInstance(),
    signIn,
    signOut,
  };
};
