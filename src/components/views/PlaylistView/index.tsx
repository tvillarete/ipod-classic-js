import { useMemo } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { ViewOptions } from 'components/views';
import { useFetchPlaylist, useMenuHideWindow, useScrollHandler } from 'hooks';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get playlist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const PlaylistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.playlist.id);
  const { data: playlist, isLoading } = useFetchPlaylist({
    id,
    inLibrary,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      playlist?.songs.map((song, index) => ({
        type: 'Song',
        label: song.name,
        sublabel: song.artistName ?? 'Unknown artist',
        imageUrl: song.artwork?.url,
        queueOptions: {
          playlist,
          startPosition: index,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      })) ?? [],
    [playlist]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.playlist.id, options);

  return (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No songs in this playlist"
    />
  );
};

export default PlaylistView;
