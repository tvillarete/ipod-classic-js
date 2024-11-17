import { useCallback, useMemo } from "react";

import {
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from "components";
import { SplitScreenPreview } from "components/previews";
import {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
  viewConfigMap,
} from "components/views";
import {
  useAudioPlayer,
  useEventListener,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
  useViewContext,
} from "hooks";
import { IpodEvent } from "utils/events";

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
        viewId: viewConfigMap.coverFlow.id,
        component: () => <CoverFlowView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Music",
        viewId: viewConfigMap.music.id,
        component: () => <MusicView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Games",
        viewId: viewConfigMap.games.id,
        component: () => <GamesView />,
        preview: SplitScreenPreview.Games,
      },
      {
        type: "view",
        label: "Settings",
        viewId: viewConfigMap.settings.id,
        component: () => <SettingsView />,
        preview: SplitScreenPreview.Settings,
      },
      // Show the sign in buttons if the user is not logged in.
      ...getConditionalOption(!isAuthorized, {
        type: "actionSheet",
        id: viewConfigMap.signinPopup.id,
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
        viewId: viewConfigMap.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: SplitScreenPreview.NowPlaying,
      }),
    ],
    [isAuthorized, nowPlayingItem, signInWithApple, signInWithSpotify]
  );

  const [scrollIndex] = useScrollHandler(viewConfigMap.home.id, options);

  const handleIdleState = useCallback(() => {
    const activeView = viewStack[viewStack.length - 1];

    const shouldShowNowPlaying =
      !!nowPlayingItem &&
      activeView.id !== viewConfigMap.nowPlaying.id &&
      activeView.id !== viewConfigMap.coverFlow.id &&
      activeView.id !== viewConfigMap.keyboard.id;

    // Only show the now playing view if we're playing a song and not already on that view.
    if (shouldShowNowPlaying) {
      showView({
        type: "screen",
        id: viewConfigMap.nowPlaying.id,
        component: NowPlayingView,
      });
    }
  }, [nowPlayingItem, showView, viewStack]);

  useEventListener<IpodEvent>("idle", handleIdleState);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
