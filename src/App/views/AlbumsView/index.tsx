import { useCallback, useEffect, useState } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

import ViewOptions, { AlbumView } from '../';

const AlbumsView = () => {
  useMenuHideWindow(ViewOptions.albums.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.albums.id, options);

  const handleMount = useCallback(async () => {
    const albums = await music.api.library.albums(null, {
      include: 'library-albums',
    });

    setOptions(
      albums.map((album) => ({
        label: album.attributes?.name ?? 'Unknown name',
        value: () => <AlbumView id={album.id ?? ''} />,
        image: Utils.getArtwork(50, album.attributes?.artwork?.url),
        viewId: ViewOptions.album.id,
      }))
    );

    setLoading(false);
  }, [music]);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default AlbumsView;
