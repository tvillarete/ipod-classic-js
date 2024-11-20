import {
  useSettings,
  useEventListener,
  useMKEventListener,
  MusicKitContext,
} from "hooks";
import { useRef, useState, useCallback, useEffect } from "react";

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
  const [hasError, setHasError] = useState(false);
  const {
    isSpotifyAuthorized,
    setIsAppleAuthorized,
    setService: setStreamingService,
  } = useSettings();

  const handleConfigure = useCallback(async () => {
    setHasError(false);
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
        bitrate: MusicKit.PlaybackBitrate.HIGH,
      });

      if (music) {
        setHasDevToken(true);
      }

      if (music.isAuthorized) {
        setIsAppleAuthorized(true);
      }
    } catch (e) {
      console.error(`MusicKit configuration error:`, e);
      setHasError(true);
      setHasDevToken(false);
    }
  }, [setIsAppleAuthorized, token]);

  useEffect(() => {
    if (window.MusicKit) {
      handleConfigure();
    } else {
      document.addEventListener("musickitloaded", handleConfigure);
    }

    return () => {
      document.removeEventListener("musickitloaded", handleConfigure);
    };
  }, [handleConfigure]);

  useEventListener("musickitconfigured", () => {
    console.log("MusicKit configured");
    setIsConfigured(true);
  });

  useMKEventListener("userTokenDidChange", (e) => {
    if (e.userToken) {
      handleConfigure();
    } else {
      setIsAppleAuthorized(false);
      setStreamingService(isSpotifyAuthorized ? "spotify" : undefined);
    }
  });

  return (
    <MusicKitContext.Provider
      value={{
        musicKit: musicKitRef.current,
        isConfigured,
        hasDevToken,
        hasError,
      }}
    >
      {children}
    </MusicKitContext.Provider>
  );
};
