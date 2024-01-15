import { useMemo } from "react";

import { SelectableList, SelectableListOption } from "components";
import { AlbumView, viewConfigMap } from "components/views";
import { useMenuHideView, useScrollHandler } from "hooks";
import * as Utils from "utils";
import { useFetchArtistAlbums } from "hooks/utils/useDataFetcher";

interface Props {
  id: string;
  /** Get artist from the user's library if true (otherwise search Apple Music). */
  inLibrary?: boolean;
}

const ArtistView = ({ id, inLibrary = false }: Props) => {
  useMenuHideView(viewConfigMap.artist.id);

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
          viewId: viewConfigMap.album.id,
          component: () => (
            <AlbumView id={album.id ?? ""} inLibrary={inLibrary} />
          ),
          longPressOptions: Utils.getMediaOptions("album", album.id),
        })
      ) ?? [],
    [albums, inLibrary]
  );

  const [scrollIndex] = useScrollHandler(viewConfigMap.artist.id, options);

  return (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No albums by this artist"
    />
  );
};

export default ArtistView;
