import { useCallback, useMemo } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import {
  useMenuHideView,
  useScrollHandler,
  useSettings,
  useMediaOptions,
} from "@/hooks";
import * as Utils from "@/utils";

import { useFetchPlaylists } from "@/hooks/utils/useDataFetcher";

interface Props {
  playlists?: MediaApi.Playlist[];
  inLibrary?: boolean;
}

const PlaylistsView = ({ playlists, inLibrary = true }: Props) => {
  useMenuHideView("playlists");
  const { isAuthorized } = useSettings();
  const { getMediaOptions } = useMediaOptions();
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
        longPressOptions: getMediaOptions("playlist", playlist),
      })) ?? []
    );
  }, [fetchedPlaylists?.pages, getMediaOptions, inLibrary, playlists]);

  // If accessing PlaylistsView from the SearchView, and there is no data cached,
  // 'isQueryLoading' will be true. To prevent an infinite loading screen in these
  // cases, we'll check if we have any 'options'
  const isLoading = !options.length && isQueryLoading;

  const handleNearEndOfList = useCallback(() => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  const [scrollIndex] = useScrollHandler(
    "playlists",
    options,
    undefined,
    handleNearEndOfList
  );

  return isAuthorized ? (
    <SelectableList
      activeIndex={scrollIndex}
      emptyMessage="No saved playlists"
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      options={options}
    />
  ) : (
    <AuthPrompt message="Sign in to view your playlists" />
  );
};

export default PlaylistsView;
