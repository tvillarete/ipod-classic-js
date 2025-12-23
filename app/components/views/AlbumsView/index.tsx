import { useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useMenuHideView, useScrollHandler, useSettings } from "@/hooks";
import * as Utils from "@/utils";

import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";

interface Props {
  albums?: MediaApi.Album[];
  inLibrary?: boolean;
}

const AlbumsView = ({ albums, inLibrary = true }: Props) => {
  const { isAuthorized } = useSettings();
  useMenuHideView("albums");

  const { data: fetchedAlbums, isLoading } = useFetchAlbums({
    // Don't fetch if we're passed an initial array of albums
    lazy: !!albums,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const data =
      albums ?? fetchedAlbums?.pages.flatMap((page) => page?.data ?? []);

    return (
      data?.map((album) => ({
        type: "view",
        headerTitle: album.name,
        label: album.name,
        subLabel: album.artistName,
        image: { url: Utils.getArtwork(300, album.artwork?.url) ?? "" },
        viewId: "album",
        props: { id: album.id ?? "", inLibrary },
      })) ?? []
    );
  }, [albums, fetchedAlbums, inLibrary]);

  const [scrollIndex] = useScrollHandler("albums", options);

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No albums"
    />
  ) : (
    <AuthPrompt />
  );
};

export default AlbumsView;
