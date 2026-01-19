import { useMemo } from "react";

import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useMenuHideView, useScrollHandler, useMediaOptions } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchPlaylist } from "@/hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get playlist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const PlaylistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideView("playlist");
  const { data: playlist, isLoading } = useFetchPlaylist({
    id,
    inLibrary,
  });
  const { getMediaOptions } = useMediaOptions();

  const options: SelectableListOption[] = useMemo(
    () =>
      playlist?.songs.map((song, index) => ({
        type: "song",
        label: song.name,
        sublabel: song.artistName ?? "Unknown artist",
        imageUrl: Utils.getArtwork(100, song.artwork?.url),
        queueOptions: {
          playlist,
          startPosition: index,
        },
        showNowPlayingView: true,
        longPressOptions: getMediaOptions("song", song),
      })) ?? [],
    [getMediaOptions, playlist]
  );

  const [scrollIndex] = useScrollHandler("playlist", options);

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
