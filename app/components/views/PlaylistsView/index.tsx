import { useMemo } from "react";

import { AuthPrompt, SelectableList, SelectableListOption } from "components";
import { useMenuHideView, useScrollHandler, useSettings } from "hooks";
import * as Utils from "utils";

import viewConfigMap, { PlaylistView } from "..";
import { useFetchPlaylists } from "hooks/utils/useDataFetcher";

interface Props {
  playlists?: MediaApi.Playlist[];
  inLibrary?: boolean;
}

const PlaylistsView = ({ playlists, inLibrary = true }: Props) => {
  useMenuHideView(viewConfigMap.playlists.id);
  const { isAuthorized } = useSettings();
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
        viewId: viewConfigMap.playlist.id,
        headerTitle: playlist.name,
        component: () => (
          <PlaylistView id={playlist.id} inLibrary={inLibrary} />
        ),
        longPressOptions: Utils.getMediaOptions("playlist", playlist.id),
      })) ?? []
    );
  }, [fetchedPlaylists?.pages, inLibrary, playlists]);

  // If accessing PlaylistsView from the SearchView, and there is no data cached,
  // 'isQueryLoading' will be true. To prevent an infinite loading screen in these
  // cases, we'll check if we have any 'options'
  const isLoading = !options.length && isQueryLoading;

  const [scrollIndex] = useScrollHandler(viewConfigMap.playlists.id, options);

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
