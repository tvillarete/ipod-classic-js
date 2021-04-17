import { useCallback, useMemo } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
} from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useForceUpdate, useMKEventListener, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

const strings = {
  nowPlaying: 'Now Playing',
};

const HomeView = () => {
  const { music } = useMusicKit();
  const forceUpdate = useForceUpdate();

  const handleLogIn = useCallback(() => {
    music.authorize();
  }, [music]);

  const options = useMemo(() => {
    const arr: SelectableListOption[] = [
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
    ];

    if (!music.isAuthorized) {
      arr.push({
        type: 'ActionSheet',
        id: ViewOptions.signinPopup.id,
        label: 'Sign in',
        listOptions: [
          {
            type: 'Action',
            label: 'Apple Music',
            onSelect: handleLogIn,
          },
        ],
        preview: PREVIEW.MUSIC,
      });
    }

    if (music.isAuthorized && music.player?.nowPlayingItem?.isPlayable) {
      arr.push({
        type: 'View',
        label: strings.nowPlaying,
        viewId: ViewOptions.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: PREVIEW.NOW_PLAYING,
      });
    }

    return arr;
  }, [
    handleLogIn,
    music.isAuthorized,
    music.player?.nowPlayingItem?.isPlayable,
  ]);

  const [scrollIndex] = useScrollHandler(ViewOptions.home.id, options);

  useMKEventListener('userTokenDidChange', forceUpdate);
  useMKEventListener('playbackStateDidChange', forceUpdate);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
