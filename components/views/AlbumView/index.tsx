import { useMemo } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { ViewOptions } from 'components/views';
import { useFetchAlbum, useMenuHideWindow, useScrollHandler } from 'hooks';
import * as Utils from 'utils';

interface Props {
  id: string;
  /** Get album from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const AlbumView = ({ id, inLibrary = false }: Props) => {
  useMenuHideWindow(ViewOptions.album.id);

  const { data: album, isLoading } = useFetchAlbum({
    id,
    inLibrary,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      album?.songs.map((song, index) => ({
        type: 'Song',
        label: song.name,
        queueOptions: {
          album,
          startPosition: index,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions('song', song.id),
      })) ?? [],
    [album]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.album.id, options);

  return (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No saved songs"
    />
  );
};

export default AlbumView;
