import React, { useMemo } from "react";

import { SelectableList, SelectableListOption } from "components";
import { SplitScreenPreview } from "components/previews";
import {
  AlbumsView,
  ArtistsView,
  CoverFlowView,
  NowPlayingView,
  PlaylistsView,
  SearchView,
  viewConfigMap,
} from "components/views";
import {
  useAudioPlayer,
  useMenuHideView,
  useScrollHandler,
  useSettings,
} from "hooks";

const MusicView = () => {
  const { isAppleAuthorized } = useSettings();
  const { nowPlayingItem } = useAudioPlayer();
  useMenuHideView(viewConfigMap.music.id);

  const options: SelectableListOption[] = useMemo(() => {
    const arr: SelectableListOption[] = [
      {
        type: "view",
        label: "Cover Flow",
        viewId: viewConfigMap.coverFlow.id,
        component: () => <CoverFlowView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Playlists",
        viewId: viewConfigMap.playlists.id,
        component: () => <PlaylistsView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Artists",
        viewId: viewConfigMap.artists.id,
        component: () => <ArtistsView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Albums",
        viewId: viewConfigMap.albums.id,
        component: () => <AlbumsView />,
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Search",
        viewId: viewConfigMap.search.id,
        component: () => <SearchView />,
        preview: SplitScreenPreview.Music,
      },
    ];

    if (isAppleAuthorized && !!nowPlayingItem) {
      arr.push({
        type: "view",
        label: "Now playing",
        viewId: viewConfigMap.nowPlaying.id,
        component: () => <NowPlayingView />,
        preview: SplitScreenPreview.NowPlaying,
      });
    }

    return arr;
  }, [isAppleAuthorized, nowPlayingItem]);

  const [scrollIndex] = useScrollHandler(viewConfigMap.music.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default MusicView;
