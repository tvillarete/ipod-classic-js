import { useMemo } from 'react';

import ViewOptions, { AlbumView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useDataFetcher, useMenuHideWindow, useScrollHandler } from 'hooks';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get artist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const ArtistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.artist.id);

  const { data: albums, isLoading } = useDataFetcher<IpodApi.Album[]>({
    name: 'artist',
    id,
    inLibrary,
  });
  const options: SelectableListOption[] = useMemo(
    () =>
      albums?.map((album) => ({
        type: 'View',
        label: album.name,
        sublabel: album.artistName,
        imageUrl: Utils.getArtwork(100, album.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => (
          <AlbumView id={album.id ?? ''} inLibrary={inLibrary} />
        ),
        longPressOptions: Utils.getMediaOptions('album', album.id),
      })) ?? [],
    [albums, inLibrary]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.artist.id, options);

  return (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
    />
  );
};

export default ArtistView;
