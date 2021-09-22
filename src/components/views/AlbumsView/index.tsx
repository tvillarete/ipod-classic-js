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

interface Props {
  albums?: IpodApi.Album[];
  inLibrary?: boolean;
}

const AlbumsView = ({ albums, inLibrary = true }: Props) => {
  const { isAuthorized } = useSettings();
  useMenuHideWindow(ViewOptions.albums.id);

  const { data: fetchedAlbums, isLoading } = useDataFetcher<IpodApi.Album[]>({
    name: 'albums',
    // Don't fetch if we're passed an initial array of albums
    lazy: !!albums,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      (albums ?? fetchedAlbums)?.map((album) => ({
        type: 'View',
        label: album.name,
        sublabel: album.artistName,
        imageUrl: Utils.getArtwork(50, album.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => (
          <AlbumView id={album.id ?? ''} inLibrary={inLibrary} />
        ),
      })) ?? [],
    [albums, fetchedAlbums, inLibrary]
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
