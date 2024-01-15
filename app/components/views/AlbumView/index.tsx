import { useMemo } from "react";

import { SelectableList, SelectableListOption } from "components";
import { viewConfigMap } from "components/views";
import { useMenuHideView, useScrollHandler } from "hooks";
import * as Utils from "utils";
import { useFetchAlbum } from "hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get album from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const AlbumView = ({ id, inLibrary = false }: Props) => {
  useMenuHideView(viewConfigMap.album.id);

  const { data: album, isLoading } = useFetchAlbum({
    id,
    inLibrary,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      album?.songs.map((song, index) => ({
        type: "song",
        label: song.name,
        queueOptions: {
          album,
          startPosition: index,
        },
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions("song", song.id),
      })) ?? [],
    [album]
  );

  const [scrollIndex] = useScrollHandler(viewConfigMap.album.id, options);

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
