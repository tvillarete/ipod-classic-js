import { useCallback, useEffect, useState } from 'react';

import ViewOptions, { AlbumView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get artist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const ArtistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.artist.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [scrollIndex] = useScrollHandler(ViewOptions.artist.id, options);

  const handleMount = useCallback(async () => {
    const albums = inLibrary
      ? await music.api.library.artistRelationship(id, 'albums')
      : await music.api.artistRelationship(id, 'albums');

    const newOptions: SelectableListOption[] = albums.map(
      (album: AppleMusicApi.Album) => ({
        type: 'View',
        label: album.attributes?.name ?? 'Unknown name',
        sublabel: album.attributes?.artistName,
        imageUrl: Utils.getArtwork(100, album.attributes?.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => (
          <AlbumView id={album.id ?? ''} inLibrary={inLibrary} />
        ),
      })
    );

    setOptions(newOptions);

    setLoading(false);
  }, [id, inLibrary, music.api]);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <SelectableList
      loading={loading}
      options={options}
      activeIndex={scrollIndex}
    />
  );
};

export default ArtistView;
