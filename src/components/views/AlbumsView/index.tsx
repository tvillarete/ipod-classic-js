import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useFetchAlbums,
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

  const {
    data: fetchedAlbums,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useFetchAlbums({
    // Don't fetch if we're passed an initial array of albums
    lazy: !!albums,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const data =
      albums ?? fetchedAlbums?.pages.flatMap((page) => page?.data ?? []);

    return (
      data?.map((album) => ({
        type: 'View',
        headerTitle: album.name,
        label: album.name,
        sublabel: album.artistName,
        imageUrl: Utils.getArtwork(50, album.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => (
          <AlbumView id={album.id ?? ''} inLibrary={inLibrary} />
        ),
      })) ?? []
    );
  }, [albums, fetchedAlbums, inLibrary]);

  const [scrollIndex] = useScrollHandler(
    ViewOptions.albums.id,
    options,
    undefined,
    fetchNextPage
  );

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No albums"
    />
  ) : (
    <AuthPrompt />
  );
};

export default AlbumsView;
