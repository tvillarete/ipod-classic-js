import { useMemo } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
} from 'App/views';
import {
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from 'components';
import {
  useAudioPlayer,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
} from 'hooks';

const strings = {
  nowPlaying: 'Now Playing',
};

const HomeView = () => {
  const { isAuthorized } = useSettings();
  const { signIn: signInWithApple } = useMusicKit();
  const { nowPlayingItem } = useAudioPlayer();
  const { signIn: signInWithSpotify } = useSpotifySDK();

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
      ...getConditionalOption(!isAuthorized, {
        type: 'ActionSheet',
        id: ViewOptions.signinPopup.id,
        label: 'Sign in',
        listOptions: [
          {
            type: 'Action',
            label: 'Apple Music',
            onSelect: signInWithApple,
          },
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
    [isAuthorized, nowPlayingItem, signInWithApple, signInWithSpotify]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.home.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
