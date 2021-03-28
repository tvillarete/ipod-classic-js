import React, { useCallback, useEffect, useState } from 'react';

import ViewOptions, { AlbumView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

interface Props {
  name: string;
  id: string;
}

const ArtistView = ({ name, id }: Props) => {
  useMenuHideWindow(ViewOptions.artist.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.artist.id, options);

  const handleMount = useCallback(async () => {
    const albums = await (music.api.library as any).artistRelationship(
      id,
      'albums'
    );

    setOptions(
      albums.map((album: AppleMusicApi.Album) => ({
        label: album.attributes?.name ?? 'Unknown name',
        value: () => <AlbumView id={album.id ?? ''} />,
        image: Utils.getArtwork(50, album.attributes?.artwork?.url),
        viewId: ViewOptions.album.id,
      }))
    );

    setLoading(false);
  }, [id, music.api]);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default ArtistView;
