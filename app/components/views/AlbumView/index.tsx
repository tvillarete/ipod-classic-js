import { useMemo } from "react";

import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useMenuHideView, useScrollHandler, useMediaOptions } from "@/hooks";
import { useFetchAlbum } from "@/hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get album from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const AlbumView = ({ id, inLibrary = false }: Props) => {
  useMenuHideView("album");
  const { getMediaOptions } = useMediaOptions();

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
        longPressOptions: getMediaOptions("song", song),
      })) ?? [],
    [album, getMediaOptions]
  );

  const [scrollIndex] = useScrollHandler("album", options);

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
