"use client";
import { memo, useCallback, useState } from "react";
import {
  AudioPlayerProvider,
  SettingsContext,
  SettingsProvider,
  useEffectOnce,
} from "@/hooks";
import { ClickWheel, ViewManager } from "@/components";
import {
  ScreenContainer,
  ClickWheelContainer,
  Shell,
  Sticker,
  Sticker2,
  Sticker3,
} from "@/components/Ipod/Styled";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpotifySDKProvider } from "@/providers/SpotifySdkProvider";
import { MusicKitProvider } from "@/providers/MusicKitProvider";
import ViewContextProvider from "@/providers/ViewContextProvider";
import { useRouter } from "next/navigation";
import { GlobalStyles } from "@/components/Ipod/GlobalStyles";
import Script from "next/script";
import { API_URL } from "@/utils/constants/api";
import { SELECTED_SERVICE_KEY } from "@/utils/service";

type Props = {
  appleAccessToken: string;
  spotifyCallbackCode?: string;
};

const Ipod = ({ appleAccessToken, spotifyCallbackCode }: Props) => {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());
  const [isLoading, setIsLoading] = useState(true);

  const handleSpotifyCallback = useCallback(
    async (code: string) => {
      await fetch(`${API_URL}/spotify/callback?code=${code}`);
      localStorage.setItem(SELECTED_SERVICE_KEY, "spotify");
      setIsLoading(false);
      router.replace("/");
    },
    [router]
  );

  useEffectOnce(() => {
    if (spotifyCallbackCode) {
      handleSpotifyCallback(spotifyCallbackCode);
      return;
    }
    setIsLoading(false);
  });

  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <SettingsProvider>
        <ViewContextProvider>
          <SpotifySDKProvider>
            <MusicKitProvider token={appleAccessToken}>
              <AudioPlayerProvider>
                <SettingsContext.Consumer>
                  {([{ deviceTheme }]) => (
                    <Shell $deviceTheme={deviceTheme}>
                      <Sticker $deviceTheme={deviceTheme} />
                      <Sticker2 $deviceTheme={deviceTheme} />
                      <Sticker3 $deviceTheme={deviceTheme} />
                      <ScreenContainer>
                        <ViewManager />
                      </ScreenContainer>
                      <ClickWheelContainer>
                        <ClickWheel />
                      </ClickWheelContainer>
                    </Shell>
                  )}
                </SettingsContext.Consumer>
              </AudioPlayerProvider>
            </MusicKitProvider>
          </SpotifySDKProvider>
        </ViewContextProvider>
      </SettingsProvider>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="lazyOnload"
      />
    </QueryClientProvider>
  );
};

export default memo(Ipod);
