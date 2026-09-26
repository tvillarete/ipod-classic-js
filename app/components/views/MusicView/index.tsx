import React, { useMemo } from "react";

import { defineView } from "@/components/views/defineView";
import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import {
  useAudioPlayer,
  useSettings,
} from "@/hooks";

const _MusicView = () => {
  const { isAppleAuthorized } = useSettings();
  const { nowPlayingItem } = useAudioPlayer();

  const options: SelectableListOption[] = useMemo(() => {
    const arr: SelectableListOption[] = [
      {
        type: "view",
        label: "Cover Flow",
        viewId: "coverFlow",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Playlists",
        viewId: "playlists",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Artists",
        viewId: "artists",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Albums",
        viewId: "albums",
        preview: SplitScreenPreview.Music,
      },
      {
        type: "view",
        label: "Search",
        viewId: "search",
        preview: SplitScreenPreview.Music,
      },
    ];

    if (isAppleAuthorized && !!nowPlayingItem) {
      arr.push({
        type: "view",
        label: "Now playing",
        viewId: "nowPlaying",
        preview: SplitScreenPreview.NowPlaying,
      });
    }

    return arr;
  }, [isAppleAuthorized, nowPlayingItem]);

  return <SelectableListView viewId="music" options={options} />;
};

export const MusicView = Object.assign(_MusicView, {
  viewConfig: defineView({
    component: _MusicView,
    type: "split",
    title: "Music",
    isSplitScreen: true,
    preview: SplitScreenPreview.Music,
  }),
});

