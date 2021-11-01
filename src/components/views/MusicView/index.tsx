import React, { useMemo } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { PREVIEW } from 'components/previews';
import {
  AlbumsView,
  ArtistsView,
  CoverFlowView,
  NowPlayingView,
  PlaylistsView,
  SearchView,
  ViewOptions,
} from 'components/views';
import { useMenuHideWindow, useMusicKit, useScrollHandler } from 'hooks';

const MusicView = () => {
  const { music } = useMusicKit();
  useMenuHideWindow(ViewOptions.music.id);

  const options: SelectableListOption[] = useMemo(() => {
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
        label: 'Playlists',
        viewId: ViewOptions.playlists.id,
        component: () => <PlaylistsView />,
        preview: PREVIEW.MUSIC,
      },
      {
        type: 'View',
        label: 'Artists',
        viewId: ViewOptions.artists.id,
        component: () => <ArtistsView />,
        preview: PREVIEW.MUSIC,
      },
      {
        type: 'View',
        label: 'Albums',
        viewId: ViewOptions.albums.id,
        component: () => <AlbumsView />,
        preview: PREVIEW.MUSIC,
      },
      {
        type: 'View',
        label: 'Search',
        viewId: ViewOptions.search.id,
        component: () => <SearchView />,
        preview: PREVIEW.MUSIC,
      },
    ];

    if (music.isAuthorized && music.player?.nowPlayingItem?.isPlayable) {
      arr.push({
        type: 'View',
        label: 'Now playing',
        viewId: ViewOptions.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: PREVIEW.NOW_PLAYING,
      });
    }

    return arr;
  }, [music.isAuthorized, music.player?.nowPlayingItem?.isPlayable]);

  const [scrollIndex] = useScrollHandler(ViewOptions.music.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default MusicView;
