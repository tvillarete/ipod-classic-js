import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useDataFetcher,
  useMenuHideWindow,
  useScrollHandler,
  useSettings,
} from 'hooks';
import * as Utils from 'utils';

import ViewOptions, { AlbumView } from '../';

const AlbumsView = () => {
  const { isAuthorized } = useSettings();
  useMenuHideWindow(ViewOptions.albums.id);

  const { data: albums, isLoading } = useDataFetcher<IpodApi.Album[]>({
    name: 'albums',
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      albums?.map((album) => ({
        type: 'View',
        label: album.name,
        sublabel: album.artistName,
        imageUrl: Utils.getArtwork(50, album.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => <AlbumView id={album.id ?? ''} inLibrary />,
      })) ?? [],
    [albums]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.albums.id, options);

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No albums"
    />
  ) : (
    <AuthPrompt />
  );
};

export default AlbumsView;
