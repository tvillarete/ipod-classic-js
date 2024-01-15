import { useMemo } from "react";

import { SelectableList, SelectableListOption } from "components";
import { viewConfigMap } from "components/views";
import { useMenuHideView, useScrollHandler } from "hooks";
import * as Utils from "utils";

interface Props {
  songs: MediaApi.Song[];
}

const SongsView = ({ songs }: Props) => {
  useMenuHideView(viewConfigMap.songs.id);

  const options: SelectableListOption[] = useMemo(
    () =>
      songs.map((song) => ({
        type: "song",
        label: song.name,
        sublabel: `${song.artistName} • ${song.albumName}`,
        queueOptions: {
          song,
          startPosition: 0,
        },
        imageUrl: Utils.getArtwork(50, song.artwork?.url),
        showNowPlayingView: true,
        longPressOptions: Utils.getMediaOptions("song", song.id),
      })) ?? [],
    [songs]
  );

  const [scrollIndex] = useScrollHandler(viewConfigMap.songs.id, options);

  return (
    <SelectableList
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No songs to show"
    />
  );
};

export default SongsView;
