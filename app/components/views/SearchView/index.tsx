import React, { useCallback, useMemo, useState } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import {
  useEffectOnce,
  useKeyboardInput,
  useMenuHideView,
  useScrollHandler,
  useSettings,
} from "@/hooks";
import { useFetchSearchResults } from "@/hooks/utils/useDataFetcher";
import { APP_URL } from "@/utils/constants/api";
import { pluralize } from "@/utils/strings";

const SearchView = () => {
  useMenuHideView("search");
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
        imageUrl: `${APP_URL}/search_icon.svg`,
        onSelect: showKeyboard,
      },
      ...getConditionalOption(!!artists?.length, {
        type: "view",
        label: "Artists",
        viewId: "artists",
        props: { artists, inLibrary: false, showImages: true },
        imageUrl: `${APP_URL}/artists_icon.svg`,
        sublabel: `${artists?.length} ${pluralize(
          "artist",
          "artists",
          artists?.length
        )}`,
      }),
      ...getConditionalOption(!!albums?.length, {
        type: "view",
        label: "Albums",
        viewId: "albums",
        props: { albums, inLibrary: false },
        imageUrl: `${APP_URL}/albums_icon.svg`,
        sublabel: `${albums?.length} ${pluralize(
          "album",
          "albums",
          albums?.length
        )}`,
      }),
      ...getConditionalOption(!!songs?.length, {
        type: "view",
        label: "Songs",
        viewId: "songs",
        props: { songs: songs ?? [] },
        imageUrl: `${APP_URL}/song_icon.svg`,
        sublabel: `${songs?.length} ${pluralize(
          "song",
          "songs",
          songs?.length
        )}`,
      }),
      ...getConditionalOption(!!playlists?.length, {
        type: "view",
        label: "Playlists",
        viewId: "playlists",
        props: { playlists, inLibrary: false },
        imageUrl: `${APP_URL}/playlist_icon.svg`,
        sublabel: `${playlists?.length} ${pluralize(
          "playlist",
          "playlists",
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

  const [scrollIndex] = useScrollHandler("search", options);

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
