import React, { createContext, useContext, useState, useCallback } from "react";

export type Song = {
  id: string;
  name: string;
  artist: string;
  album: string;
  artwork: string;
  track: number;
  url: string;
};

interface AudioState {
  playing: boolean;
  playlist: Song[];
  source?: Song;
  songIndex: number;
}

type AudioContextType = [
  AudioState,
  React.Dispatch<React.SetStateAction<AudioState>>
];

const AudioContext = createContext<AudioContextType>([
  {
    playing: false,
    playlist: [],
    source: undefined,
    songIndex: 0
  },
  () => {}
]);

export interface AudioServiceHook {
  source?: Song;
  songIndex: number;
  playing: boolean;
  playlist: Song[];
  play: (playlist: Song[], index?: number) => void;
  togglePause: () => void;
  nextSong: () => void;
}

export const useAudioService = (): AudioServiceHook => {
  const [audioState, setAudioState] = useContext(AudioContext);

  const play = useCallback(
    (playlist: Song[], index = 0) => {
      setAudioState({
        ...audioState,
        playing: true,
        playlist,
        songIndex: index,
        source: playlist[index]
      });
    },
    [audioState, setAudioState]
  );

  const togglePause = useCallback(() => {
    if (audioState.source) {
      setAudioState(prevState => ({
        ...prevState,
        playing: !prevState.playing
      }));
    }
  }, [audioState.source, setAudioState]);

  const nextSong = useCallback(() => {
    if (audioState.source) {
      setAudioState(prevState => {
        const newIndex = prevState.songIndex + 1;
        const endOfPlaylist = newIndex === prevState.playlist.length - 1;
        const newSource = endOfPlaylist
          ? prevState.source
          : prevState.playlist[newIndex];

        return {
          ...prevState,
          playing: !endOfPlaylist,
          songIndex: endOfPlaylist ? prevState.songIndex : newIndex,
          source: newSource
        };
      });
    }
  }, [audioState.source, setAudioState]);

  return {
    source: audioState.source,
    songIndex: audioState.songIndex,
    playlist: audioState.playlist,
    playing: audioState.playing,
    play,
    togglePause,
    nextSong
  };
};

interface Props {
  children: React.ReactChild;
}

const AudioProvider = ({ children }: Props) => {
  const [audioState, setAudioState] = useState<AudioState>({
    playing: false,
    playlist: [],
    source: undefined,
    songIndex: 0
  });

  return (
    <AudioContext.Provider value={[audioState, setAudioState]}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioProvider;
