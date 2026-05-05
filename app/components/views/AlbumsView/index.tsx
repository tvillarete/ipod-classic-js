import { useCallback, useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useSelectableList, useSettings } from "@/hooks";
import * as Utils from "@/utils";

import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";

interface Props {
  albums?: MediaApi.Album[];
  inLibrary?: boolean;
}

const AlbumsView = ({ albums, inLibrary = true }: Props) => {
  const { isAuthorized, isOffline } = useSettings();

  const {
    data: fetchedAlbums,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFetchAlbums({
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

  const handleNearEndOfList = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  const { activeIndex: scrollIndex } = useSelectableList({
    viewId: "albums",
    options,
    onNearEndOfList: handleNearEndOfList,
  });

  return isAuthorized && !isOffline ? (
    <SelectableList
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No albums"
    />
  ) : (
    <AuthPrompt />
  );
};

export default AlbumsView;
