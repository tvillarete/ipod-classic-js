import React, { useCallback, useMemo, useState } from "react";

import {
  AlbumsView,
  ArtistsView,
  AuthPrompt,
  getConditionalOption,
  PlaylistsView,
  SelectableList,
  SelectableListOption,
} from "components";
import { SongsView, viewConfigMap } from "components/views";
import {
  useFetchSearchResults,
  useEffectOnce,
  useKeyboardInput,
  useMenuHideView,
  useScrollHandler,
  useSettings,
} from "hooks";
import pluralize from "pluralize";

const SearchView = () => {
  useMenuHideView(viewConfigMap.search.id);
  const { isAuthorized } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    refetch,
    data: searchResults,
    isFetching,
  } = useFetchSearchResults({
    query: searchTerm,
    lazy: true,
  });

  const handleEnterPress = useCallback(() => {
    if (searchTerm) {
      refetch();
    }
  }, [refetch, searchTerm]);

  const { showKeyboard } = useKeyboardInput({
    onChange: (value) => setSearchTerm(value),
    onEnterPress: handleEnterPress,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const artists = searchResults?.artists;
    const albums = searchResults?.albums;
    const songs = searchResults?.songs;
    const playlists = searchResults?.playlists;

    const arr: SelectableListOption[] = [
      {
        type: "action",
        label: "Search",
        sublabel: searchTerm
          ? `Results for: ${searchTerm}`
          : "Enter text to search",
        imageUrl: "search_icon.svg",
        onSelect: showKeyboard,
      },
      ...getConditionalOption(!!artists?.length, {
        type: "view",
        label: "Artists",
        viewId: viewConfigMap.artists.id,
        component: () => (
          <ArtistsView artists={artists} inLibrary={false} showImages />
        ),
        imageUrl: "artists_icon.svg",
        sublabel: `${artists?.length} ${pluralize("artist", artists?.length)}`,
      }),
      ...getConditionalOption(!!albums?.length, {
        type: "view",
        label: "Albums",
        viewId: viewConfigMap.albums.id,
        component: () => <AlbumsView albums={albums} inLibrary={false} />,
        imageUrl: "albums_icon.svg",
        sublabel: `${albums?.length} ${pluralize("album", albums?.length)}`,
      }),
      ...getConditionalOption(!!songs?.length, {
        type: "view",
        label: "Songs",
        viewId: viewConfigMap.songs.id,
        component: () => <SongsView songs={songs!} />,
        imageUrl: "song_icon.svg",
        sublabel: `${songs?.length} ${pluralize("song", songs?.length)}`,
      }),
      ...getConditionalOption(!!playlists?.length, {
        type: "view",
        label: "Playlists",
        viewId: viewConfigMap.playlists.id,
        component: () => (
          <PlaylistsView playlists={playlists!} inLibrary={false} />
        ),
        imageUrl: "playlist_icon.svg",
        sublabel: `${playlists?.length} ${pluralize(
          "playlist",
          playlists?.length
        )}`,
      }),
    ];

    return arr;
  }, [
    searchResults?.albums,
    searchResults?.artists,
    searchResults?.playlists,
    searchResults?.songs,
    searchTerm,
    showKeyboard,
  ]);

  useEffectOnce(() => {
    if (isAuthorized) {
      showKeyboard();
    }
  });

  const [scrollIndex] = useScrollHandler(viewConfigMap.search.id, options);

  return isAuthorized ? (
    <SelectableList
      loading={isFetching}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No results"
    />
  ) : (
    <AuthPrompt message="Sign in to search" />
  );
};

export default SearchView;
