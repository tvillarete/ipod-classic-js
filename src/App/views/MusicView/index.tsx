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
  ];
  const [scrollIndex] = useScrollHandler(ViewOptions.music.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default MusicView;
