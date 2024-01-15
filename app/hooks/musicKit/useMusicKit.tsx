import { createContext, useCallback, useContext } from "react";

import { useSettings } from "hooks";

export interface MusicKitState {
  musicKit?: typeof MusicKit;
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
  const { setIsAppleAuthorized, isSpotifyAuthorized, setService } =
    useSettings();
  const { isConfigured, hasDevToken } = useContext(MusicKitContext);

  const signIn = useCallback(async () => {
    const music = window.MusicKit?.getInstance();

    if (music?.isAuthorized === false) {
      await music?.authorize();
    }

    setService("apple");
  }, [setService]);

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
    musicKit: window.MusicKit,
    music: window.MusicKit?.getInstance(),
    signIn,
    signOut,
  };
};
