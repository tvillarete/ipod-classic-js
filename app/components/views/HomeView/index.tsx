import { useCallback, useMemo } from "react";

import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import {
  useAudioPlayer,
  useEventListener,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
  useViewContext,
} from "@/hooks";
import { IpodEvent } from "@/utils/events";

const strings = {
  nowPlaying: "Now Playing",
};

const HomeView = () => {
  const { isAuthorized } = useSettings();
  const { signIn: signInWithApple, isConfigured: isMkConfigured } =
    useMusicKit();
  const { nowPlayingItem } = useAudioPlayer();
  const { signIn: signInWithSpotify } = useSpotifySDK();
  const { showView, viewStack } = useViewContext();

  const options: SelectableListOption[] = useMemo(
    () => [
      {
        type: "view",
        label: "Cover Flow",
        viewId: "coverFlow",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Music",
        viewId: "music",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Games",
        viewId: "games",
        preview: SplitScreenPreview.Games,
      },
      {
        type: "view",
        label: "Settings",
        viewId: "settings",
        preview: SplitScreenPreview.Settings,
      },
      // Show the sign in buttons if the user is not logged in.
      ...getConditionalOption(!isAuthorized, {
        type: "actionSheet",
        id: "signin-popup",
        label: "Sign in",
        listOptions: [
          {
            type: "action",
            label: "Apple Music",
            onSelect: signInWithApple,
          },
          {
            type: "action",
            label: "Spotify",
            onSelect: signInWithSpotify,
          },
        ],
        preview: SplitScreenPreview.Music,
      }),
      ...getConditionalOption(!!nowPlayingItem, {
        type: "view",
        label: strings.nowPlaying,
        viewId: "nowPlaying",
        preview: SplitScreenPreview.NowPlaying,
      }),
    ],
    [isAuthorized, nowPlayingItem, signInWithApple, signInWithSpotify]
  );

  const [scrollIndex] = useScrollHandler("home", options);

  const handleIdleState = useCallback(() => {
    const activeView = viewStack[viewStack.length - 1];

    const shouldShowNowPlaying =
      !!nowPlayingItem &&
      activeView.id !== "nowPlaying" &&
      activeView.id !== "coverFlow" &&
      activeView.id !== "keyboard";

    // Only show the now playing view if we're playing a song and not already on that view.
    if (shouldShowNowPlaying) {
      showView("nowPlaying");
    }
  }, [nowPlayingItem, showView, viewStack]);

  useEventListener<IpodEvent>("idle", handleIdleState);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
