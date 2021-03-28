import { useCallback, useEffect, useState } from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

interface Props {
  id: string;
}

const AlbumView = ({ id }: Props) => {
  useMenuHideWindow(ViewOptions.album.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.album.id, options);

  const handleMount = useCallback(async () => {
    const album = await music.api.library.album(id);
    const songs = album.relationships?.tracks.data ?? [];

    setOptions(
      songs.map((song, index) => ({
        type: 'Song',
        label: song.attributes?.name ?? 'Unknown song',
        queueOptions: {
          album: id,
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

export default AlbumView;
