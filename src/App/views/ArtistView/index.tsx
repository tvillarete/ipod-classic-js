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
  const [scrollIndex] = useScrollHandler(ViewOptions.artist.id, options);

  const handleMount = useCallback(async () => {
    const albums = await music.api.library.artistRelationship(id, 'albums');

    const newOptions: SelectableListOption[] = albums.map(
      (album: AppleMusicApi.Album) => ({
        type: 'View',
        label: album.attributes?.name ?? 'Unknown name',
        imageUrl: Utils.getArtwork(50, album.attributes?.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => <AlbumView id={album.id ?? ''} />,
      })
    );

    setOptions(newOptions);

    setLoading(false);
  }, [id, music.api]);

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
