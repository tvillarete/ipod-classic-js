import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { useEventListener, useMKEventListener, useSettings } from "hooks";

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
  const musicKit = typeof window === "undefined" ? undefined : window.MusicKit;
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

    setService("apple");
  }, [music, setService]);

  const signOut = useCallback(() => {
    music.unauthorize();
    setIsAppleAuthorized(false);

    // Change to Spotify if available.
    setService(isSpotifyAuthorized ? "spotify" : undefined);
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
  token: string;
}

export const MusicKitProvider = ({ children, token }: Props) => {
  const musicKitRef = useRef<typeof MusicKit>();
  const [hasDevToken, setHasDevToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const {
    isSpotifyAuthorized,
    setIsAppleAuthorized,
    setService: setStreamingService,
  } = useSettings();

  const handleConfigure = useCallback(async () => {
    try {
      const music = await window.MusicKit.configure({
        developerToken: token,
        app: {
          name: "iPod.js",
          build: "1.0",
        },
      });

      if (music) {
        setHasDevToken(true);
      }

      if (music.isAuthorized) {
        setIsAppleAuthorized(true);
      }
    } catch (e) {
      console.error(`MusicKit configuration error:`, e);
      setHasDevToken(false);
    }
  }, [setIsAppleAuthorized, token]);

  useEventListener("musickitloaded", () => {
    handleConfigure();
  });

  useEventListener("musickitconfigured", (e) => {
    console.log("MusicKit configured");
    setIsConfigured(true);
  });

  useMKEventListener("userTokenDidChange", (e) => {
    if (e.userToken) {
      setIsAppleAuthorized(true);
      setStreamingService("apple");
    } else {
      setIsAppleAuthorized(false);
      setStreamingService(isSpotifyAuthorized ? "spotify" : undefined);
    }
  });

  return (
    <MusicKitContext.Provider
      value={{ musicKit: musicKitRef.current, isConfigured, hasDevToken }}
    >
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
