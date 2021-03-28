import { useCallback, useEffect, useState } from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

interface Props {
  id: string;
}

const PlaylistView = ({ id }: Props) => {
  useMenuHideWindow(ViewOptions.playlist.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.playlist.id, options);

  const handleMount = useCallback(async () => {
    const playlist = await music.api.library.playlist(id);
    const songs = playlist.relationships?.tracks?.data ?? [];

    setOptions(
      songs.map((song, index) => ({
        type: 'Song',
        label: song.attributes?.name ?? 'Unknown song',
        sublabel: song.attributes?.artistName ?? 'Unknown artist',
        imageUrl: Utils.getArtwork(100, song.attributes?.artwork?.url),
        queueOptions: {
          playlist: id,
          startPosition: index,
        },
        showNowPlayingView: true,
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

export default PlaylistView;
