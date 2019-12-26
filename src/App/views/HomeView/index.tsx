import React, { useState, useEffect, useCallback } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { MusicView, ArtistsView, GamesView } from "App/views";
import { useAudioService } from "services/audio";
import NowPlayingView from "../NowPlayingView";

const initialOptions: SelectableListOption[] = [
  {
    label: "Music",
    value: () => <MusicView />
  },
  {
    label: "Artists",
    value: () => <ArtistsView />
  },
  {
    label: "Games",
    value: () => <GamesView />
  }
];

const strings = {
  nowPlaying: "Now Playing"
};

const HomeView = () => {
  const [options, setOptions] = useState(initialOptions);
  const { source } = useAudioService();
  const [index] = useScrollHandler(ViewIds.home, options);

  /** Append the "Now Playing" button to the list of options. */
  const showNowPlaying = useCallback(() => {
    if (
      source &&
      !options.find(option => option.label === strings.nowPlaying)
    ) {
      setOptions([
        ...options,
        {
          label: strings.nowPlaying,
          value: () => <NowPlayingView song={source} />
        }
      ]);
    }
  }, [options, source]);

  /** Remove the "Now Playing" button from the list of options. */
  const hideNowPlaying = useCallback(() => {
    if (options.find(option => option.label === strings.nowPlaying)) {
      setOptions(options.filter(option => option.label !== strings.nowPlaying));
    }
  }, [options]);

  /** Conditionally show "Now Playing" button if music is queued/playing. */
  useEffect(() => {
    if (source) {
      showNowPlaying();
    } else {
      hideNowPlaying();
    }
  }, [hideNowPlaying, showNowPlaying, source]);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
