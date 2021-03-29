import { useCallback, useEffect, useState } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

import ViewOptions, { AlbumView } from '../';

const AlbumsView = () => {
  useMenuHideWindow(ViewOptions.albums.id);
  const { music, isAuthorized } = useMusicKit();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [scrollIndex] = useScrollHandler(ViewOptions.albums.id, options);

  const handleMount = useCallback(async () => {
    setLoading(true);
    const albums = await music.api.library.albums(null, {
      include: 'library-albums',
    });

    setOptions(
      albums.map((album) => ({
        type: 'View',
        label: album.attributes?.name ?? 'Unknown name',
        imageUrl: Utils.getArtwork(50, album.attributes?.artwork?.url),
        viewId: ViewOptions.album.id,
        component: () => <AlbumView id={album.id ?? ''} />,
      }))
    );

    setLoading(false);
  }, [music]);

  useEffect(() => {
    if (isAuthorized) {
      handleMount();
    }
  }, [handleMount, isAuthorized]);

  return isAuthorized ? (
    <SelectableList
      loading={loading}
      options={options}
      activeIndex={scrollIndex}
    />
  ) : (
    <AuthPrompt />
  );
};

export default AlbumsView;
