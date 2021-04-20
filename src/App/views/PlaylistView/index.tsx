import { useMemo } from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useDataFetcher, useMenuHideWindow, useScrollHandler } from 'hooks';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get playlist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const PlaylistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.playlist.id);
  const { data, isLoading } = useDataFetcher<IpodApi.Playlist>({
    name: 'playlist',
    id,
    inLibrary,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      data?.songs.map((song, index) => ({
        type: 'Song',
        label: song.name,
        sublabel: song.artistName ?? 'Unknown artist',
        imageUrl: song.artwork?.url,
        queueOptions: {
          songs: data?.songs.map(({ url }) => url),
          startPosition: index,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      })) ?? [],
    [data?.songs]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.playlist.id, options);

  return (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
    />
  );
};

export default PlaylistView;
