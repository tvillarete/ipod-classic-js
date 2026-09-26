import { useMemo } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import * as Utils from "@/utils";
import { useFetchArtistAlbums } from "@/hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get artist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const _ArtistView = ({ id, inLibrary = false }: Props) => {
  const { data: albums, isLoading } = useFetchArtistAlbums({
    id,
    inLibrary,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      albums?.map(
        (album): SelectableListOption => ({
          type: "view",
          headerTitle: album.name,
          label: album.name,
          sublabel: album.artistName,
          imageUrl: Utils.getArtwork(100, album.artwork?.url),
          viewId: "album",
          props: { id: album.id ?? "", inLibrary },
          longPressOptions: Utils.getMediaOptions("album", album.id),
        })
      ) ?? [],
    [albums, inLibrary]
  );

  return (
    <SelectableListView
      viewId="artist"
      options={options}
      loading={isLoading}
      emptyMessage="No albums by this artist"
    />
  );
};

export const ArtistView = Object.assign(_ArtistView, {
  viewConfig: defineView({
    component: _ArtistView,
    type: "full",
    title: "Artist",
    preview: SplitScreenPreview.Music,
  }),
});
