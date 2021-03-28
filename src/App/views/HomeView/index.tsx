import React, { useCallback, useEffect, useState } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
} from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

const strings = {
  nowPlaying: 'Now Playing',
};

const HomeView = () => {
  const initialOptions: SelectableListOption[] = [
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

  const [options, setOptions] = useState(initialOptions);
  const { music, isConfigured } = useMusicKit();
  const [index] = useScrollHandler(ViewOptions.home.id, options);

  /** Append the "Now Playing" button to the list of options. */
  const showNowPlaying = useCallback(() => {
    if (
      isConfigured &&
      music.player?.nowPlayingItem &&
      !options.find((option) => option.label === strings.nowPlaying)
    ) {
      setOptions([
        ...options,
        {
          type: 'View',
          label: strings.nowPlaying,
          viewId: ViewOptions.nowPlaying.id,
          component: () => <NowPlayingView />,
          preview: PREVIEW.NOW_PLAYING,
        },
      ]);
    }
  }, [isConfigured, music.player?.nowPlayingItem, options]);

  /** Remove the "Now Playing" button from the list of options. */
  const hideNowPlaying = useCallback(() => {
    if (options.find((option) => option.label === strings.nowPlaying)) {
      setOptions(
        options.filter((option) => option.label !== strings.nowPlaying)
      );
    }
  }, [options]);

  /** Conditionally show "Now Playing" button if music is queued/playing. */
  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    if (music.player?.nowPlayingItem) {
      showNowPlaying();
    } else {
      hideNowPlaying();
    }
  }, [
    hideNowPlaying,
    isConfigured,
    music.player?.nowPlayingItem,
    showNowPlaying,
  ]);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
