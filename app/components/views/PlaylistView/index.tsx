import { useMemo } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import * as Utils from "@/utils";
import { useFetchPlaylist } from "@/hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get playlist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const _PlaylistView = ({ id, inLibrary = false }: Props) => {
  const { data: playlist, isLoading } = useFetchPlaylist({
    id,
    inLibrary,
  });

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
        longPressOptions: Utils.getMediaOptions("song", song.id),
      })) ?? [],
    [playlist]
  );

  return (
    <SelectableListView
      viewId="playlist"
      options={options}
      loading={isLoading}
      emptyMessage="No songs in this playlist"
    />
  );
};

export const PlaylistView = Object.assign(_PlaylistView, {
  viewConfig: defineView({
    component: _PlaylistView,
    type: "full",
    title: "Playlist",
    preview: SplitScreenPreview.Music,
  }),
});
