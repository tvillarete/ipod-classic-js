import {
  useSettings,
  useEventListener,
  useMKEventListener,
  MusicKitContext,
  useEffectOnce,
} from "hooks";
import { useRef, useState, useCallback } from "react";

export interface MusicKitProviderProps {
  children: React.ReactNode;
  token: string;
}

export const MusicKitProvider = ({
  children,
  token,
}: MusicKitProviderProps) => {
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
      if (!window.MusicKit) {
        throw new Error("MusicKit was unable to mount");
      }

      const music = await window.MusicKit.configure({
        developerToken: token,
        app: {
          name: "Apple Music.js",
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

  useEffectOnce(() => {
    handleConfigure();
  });

  useEventListener("musickitconfigured", () => {
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
