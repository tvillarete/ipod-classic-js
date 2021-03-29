import React, { useCallback, useState } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
} from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useEffectOnce, useMKEventListener, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

const strings = {
  nowPlaying: 'Now Playing',
};

const HomeView = () => {
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const { music, isAuthorized } = useMusicKit();
  const [scrollIndex] = useScrollHandler(ViewOptions.home.id, options);

  const handleLogIn = useCallback(() => {
    music.authorize();
  }, [music]);

  const handleUpdateOptions = useCallback(() => {
    const updatedOptions: SelectableListOption[] = [
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

    if (!isAuthorized) {
      updatedOptions.push({
        type: 'Action',
        label: 'Sign in',
        onSelect: handleLogIn,
        preview: PREVIEW.MUSIC,
      });
    }

    if (music.player?.nowPlayingItem) {
      updatedOptions.push({
        type: 'View',
        label: strings.nowPlaying,
        viewId: ViewOptions.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: PREVIEW.NOW_PLAYING,
      });
    }

    setOptions(updatedOptions);
  }, [handleLogIn, isAuthorized, music.player?.nowPlayingItem]);

  useMKEventListener('userTokenDidChange', handleUpdateOptions);
  useMKEventListener('playbackStateDidChange', handleUpdateOptions);

  useEffectOnce(handleUpdateOptions);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
