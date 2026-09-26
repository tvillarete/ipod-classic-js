import { useCallback, useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import { useSettings } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchPlaylists } from "@/hooks/utils/useDataFetcher";

interface Props {
  playlists?: MediaApi.Playlist[];
  inLibrary?: boolean;
}

const _PlaylistsView = ({ playlists, inLibrary = true }: Props) => {
  const { isAuthorized, isOffline } = useSettings();
  const {
    data: fetchedPlaylists,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
  } = useFetchPlaylists({
    lazy: !!playlists,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const data =
      playlists ?? fetchedPlaylists?.pages.flatMap((page) => page?.data ?? []);

    return (
      data?.map((playlist) => ({
        type: "view",
        label: playlist.name,
        sublabel: playlist.description || `By ${playlist.curatorName}`,
        imageUrl: Utils.getArtwork(100, playlist.artwork?.url),
        viewId: "playlist",
        headerTitle: playlist.name,
        props: { id: playlist.id, inLibrary },
        longPressOptions: Utils.getMediaOptions("playlist", playlist.id),
      })) ?? []
    );
  }, [fetchedPlaylists?.pages, inLibrary, playlists]);

  const isLoading = !options.length && isQueryLoading;

  const handleNearEndOfList = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  if (!isAuthorized || isOffline) {
    return <AuthPrompt message="Sign in to view your playlists" />;
  }

  return (
    <SelectableListView
      viewId="playlists"
      options={options}
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      onNearEndOfList={handleNearEndOfList}
      emptyMessage="No saved playlists"
    />
  );
};

export const PlaylistsView = Object.assign(_PlaylistsView, {
  viewConfig: defineView({
    component: _PlaylistsView,
    type: "full",
    title: "Playlists",
    preview: SplitScreenPreview.Music,
  }),
});
