import { useCallback, useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import { useSettings } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchArtists } from "@/hooks/utils/useDataFetcher";

interface Props {
  artists?: MediaApi.Artist[];
  inLibrary?: boolean;
  showImages?: boolean;
}

const _ArtistsView = ({
  artists,
  inLibrary = true,
  showImages = false,
}: Props) => {
  const { isAuthorized, isOffline } = useSettings();
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

  const isLoading = !options.length && isQueryLoading;

  const handleNearEndOfList = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  return (
    <SelectableListView
      viewId="artists"
      options={!isAuthorized || isOffline ? [] : options}
      loading={isAuthorized && !isOffline && isLoading}
      loadingNextItems={isFetchingNextPage}
      onNearEndOfList={handleNearEndOfList}
      emptyMessage="No saved artists"
      emptyContent={
        !isAuthorized || isOffline
          ? <AuthPrompt message="Sign in to view your artists" />
          : undefined
      }
    />
  );
};

export const ArtistsView = Object.assign(_ArtistsView, {
  viewConfig: defineView({
    component: _ArtistsView,
    type: "full",
    title: "Artists",
    preview: SplitScreenPreview.Music,
  }),
});
