import { useMemo } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { ViewOptions } from 'components/views';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import * as Utils from 'utils';

interface Props {
  songs: IpodApi.Song[];
}

const SongsView = ({ songs }: Props) => {
  useMenuHideWindow(ViewOptions.songs.id);

  const options: SelectableListOption[] = useMemo(
    () =>
      songs.map((song) => ({
        type: 'Song',
        label: song.name,
        sublabel: `${song.artistName} • ${song.albumName}`,
        queueOptions: {
          song,
          startPosition: 0,
        },
        imageUrl: Utils.getArtwork(50, song.artwork?.url),
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      })) ?? [],
    [songs]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.songs.id, options);

  return (
    <SelectableList
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No songs to show"
    />
  );
};

export default SongsView;
