import { useCallback, useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useMenuHideView, useScrollHandler, useSettings } from "@/hooks";
import * as Utils from "@/utils";

import { useFetchArtists } from "@/hooks/utils/useDataFetcher";

interface Props {
  artists?: MediaApi.Artist[];
  inLibrary?: boolean;
  showImages?: boolean;
}

const ArtistsView = ({
  artists,
  inLibrary = true,
  showImages = false,
}: Props) => {
  useMenuHideView("artists");
  const { isAuthorized } = useSettings();
  const {
    data: fetchedArtists,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
  } = useFetchArtists({
    lazy: !!artists,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const data =
      artists ?? fetchedArtists?.pages.flatMap((page) => page?.data ?? []);

    return (
      data?.map(
        (artist): SelectableListOption => ({
          type: "view",
          headerTitle: artist.name,
          label: artist.name,
          viewId: "artist",
          imageUrl: showImages
            ? (Utils.getArtwork(50, artist.artwork?.url) ?? "artists_icon.svg")
            : "",
          props: { id: artist.id, inLibrary },
        })
      ) ?? []
    );
  }, [artists, fetchedArtists, inLibrary, showImages]);

  // If accessing ArtistsView from the SearchView, and there is no data cached,
  // 'isQueryLoading' will be true. To prevent an infinite loading screen in these
  // cases, we'll check if we have any 'options'
  const isLoading = !options.length && isQueryLoading;

  const handleNearEndOfList = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  const [scrollIndex] = useScrollHandler(
    "artists",
    options,
    undefined,
    handleNearEndOfList
  );

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No saved artists"
    />
  ) : (
    <AuthPrompt message="Sign in to view your artists" />
  );
};

export default ArtistsView;
