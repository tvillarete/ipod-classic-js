import React from 'react';

import { PREVIEW } from 'App/previews';
import {
  AlbumsView,
  ArtistsView,
  CoverFlowView,
  PlaylistsView,
} from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';

import ViewOptions from '../';

const MusicView = () => {
  useMenuHideWindow(ViewOptions.music.id);
  const options: SelectableListOption[] = [
    {
      label: 'Cover Flow',
      value: () => <CoverFlowView />,
      viewId: ViewOptions.coverFlow.id,
      preview: PREVIEW.MUSIC,
    },
    {
      label: 'Artists',
      value: () => <ArtistsView />,
      viewId: ViewOptions.artists.id,
      preview: PREVIEW.MUSIC,
    },
    {
      label: 'Albums',
      value: () => <AlbumsView />,
      viewId: ViewOptions.albums.id,
      preview: PREVIEW.MUSIC,
    },
    {
      label: 'Playlists',
      value: () => <PlaylistsView />,
      viewId: ViewOptions.playlists.id,
      preview: PREVIEW.MUSIC,
    },
  ];
  const [index] = useScrollHandler(ViewOptions.music.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default MusicView;
