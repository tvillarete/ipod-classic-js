import { useMemo } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import * as Utils from "@/utils";

interface Props {
  songs: MediaApi.Song[];
}

const _SongsView = ({ songs }: Props) => {
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

  return (
    <SelectableListView
      viewId="songs"
      options={options}
      emptyMessage="No songs to show"
    />
  );
};

export const SongsView = Object.assign(_SongsView, {
  viewConfig: defineView({
    component: _SongsView,
    type: "full",
    title: "Songs",
    preview: SplitScreenPreview.Music,
  }),
});
