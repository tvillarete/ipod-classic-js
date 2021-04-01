import { useCallback, useEffect, useState } from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get playlist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const PlaylistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.playlist.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [scrollIndex] = useScrollHandler(ViewOptions.playlist.id, options);

  const handleMount = useCallback(async () => {
    const playlist = inLibrary
      ? await music.api.library.playlist(id)
      : await music.api.playlist(id);
    const songs = playlist.relationships?.tracks?.data ?? [];

    setOptions(
      songs.map((song, index) => ({
        type: 'Song',
        label: song.attributes?.name ?? 'Unknown song',
        sublabel: song.attributes?.artistName ?? 'Unknown artist',
        imageUrl: Utils.getArtwork(100, song.attributes?.artwork?.url),
        queueOptions: {
          playlist: id,
          startPosition: index - 1,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      }))
    );

    setLoading(false);
  }, [id, inLibrary, music]);

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

export default PlaylistView;
