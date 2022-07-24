import { useCallback, useMemo } from 'react';

import {
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from 'components';
import { PREVIEW } from 'components/previews';
import {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
  ViewOptions,
  WINDOW_TYPE,
} from 'components/views';
import {
  useAudioPlayer,
  useEventListener,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
  useWindowContext,
} from 'hooks';
import { IpodEvent } from 'utils/events';

const strings = {
  nowPlaying: 'Now Playing',
};

const HomeView = () => {
  const { isAuthorized } = useSettings();
  const { signIn: signInWithApple, isConfigured: isMkConfigured } =
    useMusicKit();
  const { nowPlayingItem } = useAudioPlayer();
  const { signIn: signInWithSpotify } = useSpotifySDK();
  const { showWindow, windowStack } = useWindowContext();

  const options: SelectableListOption[] = useMemo(
    () => [
      {
        type: 'View',
        label: 'Cover Flow',
        viewId: ViewOptions.coverFlow.id,
        component: () => <CoverFlowView />,
        preview: PREVIEW.MUSIC,
      },
      {
        type: 'View',
        label: 'Music',
        viewId: ViewOptions.music.id,
        component: () => <MusicView />,
        preview: PREVIEW.MUSIC,
      },
      {
        type: 'View',
        label: 'Games',
        viewId: ViewOptions.games.id,
        component: () => <GamesView />,
        preview: PREVIEW.GAMES,
      },
      {
        type: 'View',
        label: 'Settings',
        viewId: ViewOptions.settings.id,
        component: () => <SettingsView />,
        preview: PREVIEW.SETTINGS,
      },
      // Show the sign in buttons if the user is not logged in.
      ...getConditionalOption(!isAuthorized, {
        type: 'ActionSheet',
        id: ViewOptions.signinPopup.id,
        label: 'Sign in',
        listOptions: [
          ...getConditionalOption(isMkConfigured, {
            type: 'Action',
            label: 'Apple Music',
            onSelect: signInWithApple,
          }),
          {
            type: 'Action',
            label: 'Spotify',
            onSelect: signInWithSpotify,
          },
        ],
        preview: PREVIEW.MUSIC,
      }),
      ...getConditionalOption(!!nowPlayingItem, {
        type: 'View',
        label: strings.nowPlaying,
        viewId: ViewOptions.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: PREVIEW.NOW_PLAYING,
      }),
    ],
    [
      isAuthorized,
      isMkConfigured,
      nowPlayingItem,
      signInWithApple,
      signInWithSpotify,
    ]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.home.id, options);

  const handleIdleState = useCallback(() => {
    const activeView = windowStack[windowStack.length - 1];

    const shouldShowNowPlaying =
      !!nowPlayingItem &&
      activeView.id !== ViewOptions.nowPlaying.id &&
      activeView.id !== ViewOptions.coverFlow.id &&
      activeView.id !== ViewOptions.keyboard.id;

    // Only show the now playing view if we're playing a song and not already on that view.
    if (shouldShowNowPlaying) {
      showWindow({
        id: ViewOptions.nowPlaying.id,
        type: WINDOW_TYPE.FULL,
        component: NowPlayingView,
      });
    }
  }, [nowPlayingItem, showWindow, windowStack]);

  useEventListener<IpodEvent>('idle', handleIdleState);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
