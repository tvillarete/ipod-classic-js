import React, { useCallback, useEffect, useState } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

import ViewOptions, { PlaylistView } from '../';

const PlaylistsView = () => {
  useMenuHideWindow(ViewOptions.playlists.id);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.playlists.id, options);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);

  const handleMount = useCallback(async () => {
    const playlists = await music.api.library.playlists(null, {
      limit: 100,
    });

    setOptions(
      playlists.map((playlist) => ({
        label: playlist.attributes?.name ?? 'Unknown playlist',
        value: () => <PlaylistView id={playlist.id} />,
        image: Utils.getArtwork(100, playlist.attributes?.artwork?.url),
        viewId: ViewOptions.playlist.id,
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

export default PlaylistsView;
