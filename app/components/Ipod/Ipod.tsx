"use client";
import { memo, useCallback, useState } from "react";
import { ScrollWheel } from "components";
import * as SpotifyUtils from "utils/spotify";
import {
  AudioPlayerProvider,
  SettingsProvider,
  useEffectOnce,
  useSettings,
} from "hooks";
import { ViewManager } from "components";
import {
  ScreenContainer,
  Shell,
  Sticker,
  Sticker2,
  Sticker3,
} from "components/Ipod/Styled";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpotifySDKProvider } from "providers/SpotifySdkProvider";
import { MusicKitProvider } from "providers/MusicKitProvider";
import ViewContextProvider from "providers/ViewContextProvider";
import { useRouter } from "next/navigation";
import { GlobalStyles } from "components/Ipod/GlobalStyles";
import Script from "next/script";

type Props = {
  appleAccessToken: string;
  /**
   * Used when the user is redirected back from Spotify's OAuth flow.
   * This is the code that is used to get the access token.
   */
  spotifyCallbackCode?: string;
};

const Ipod = ({ appleAccessToken, spotifyCallbackCode }: Props) => {
  const { deviceTheme } = useSettings();

  const router = useRouter();
  const queryClient = new QueryClient();
  const [isLoading, setIsLoading] = useState(true);

  const handleCheckSpotifyCallback = useCallback(
    async (code: string) => {
      await SpotifyUtils.handleSpotifyCode(code);

      setIsLoading(false);

      router.replace("/");
    },
    [router]
  );

  useEffectOnce(() => {
    if (spotifyCallbackCode) {
      handleCheckSpotifyCallback(spotifyCallbackCode);
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
                <Shell $deviceTheme={deviceTheme}>
                  <Sticker $deviceTheme={deviceTheme} />
                  <Sticker2 $deviceTheme={deviceTheme} />
                  <Sticker3 $deviceTheme={deviceTheme} />
                  <ScreenContainer>
                    <ViewManager />
                  </ScreenContainer>
                  <ScrollWheel />
                </Shell>
              </AudioPlayerProvider>
            </MusicKitProvider>
          </SpotifySDKProvider>
        </ViewContextProvider>
      </SettingsProvider>
      <Script src="https://sdk.scdn.co/spotify-player.js" />
    </QueryClientProvider>
  );
};

export default memo(Ipod);
