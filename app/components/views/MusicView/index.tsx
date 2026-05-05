import React, { useMemo } from "react";

import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import {
  useAudioPlayer,
  useSelectableList,
  useSettings,
} from "@/hooks";

const MusicView = () => {
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

  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "music", options });

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default MusicView;
