import { useCallback, useEffect, useState } from 'react';

import ViewOptions, { NowPlayingView } from 'App/views';
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
        label: song.attributes?.name ?? 'Unknown song',
        sublabel: song.attributes?.artistName ?? 'Unknown artist',
        value: () => <NowPlayingView />,
        viewId: ViewOptions.nowPlaying.id,
        songIndex: index,
        image: Utils.getArtwork(100, song.attributes?.artwork?.url),
        playlistId: id,
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
