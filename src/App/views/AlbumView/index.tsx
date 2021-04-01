import { useCallback, useEffect, useState } from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get album from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const AlbumView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.album.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [scrollIndex] = useScrollHandler(ViewOptions.album.id, options);

  const handleMount = useCallback(async () => {
    const album = inLibrary
      ? await music.api.library.album(id)
      : await music.api.album(id);
    const songs = album.relationships?.tracks.data ?? [];

    setOptions(
      songs.map((song, index) => ({
        type: 'Song',
        label: song.attributes?.name ?? 'Unknown song',
        queueOptions: {
          album: id,
          startPosition: index - 1,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      }))
    );

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

export default AlbumView;
