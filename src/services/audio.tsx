import React, { createContext, useCallback, useContext, useState } from 'react';

import { setDocumentSongTitle } from 'utils';

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
  loading: boolean;
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
    loading: false,
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
  loading: boolean;
  playlist: Song[];
  play: (playlist: Song[], index?: number) => void;
  togglePause: () => void;
  nextSong: () => void;
  setLoading: (value: boolean) => void;
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
      setDocumentSongTitle(playlist[index]);
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
        setDocumentSongTitle(newSource);

        return {
          ...prevState,
          playing: !endOfPlaylist,
          songIndex: endOfPlaylist ? prevState.songIndex : newIndex,
          source: newSource
        };
      });
    }
  }, [audioState.source, setAudioState]);

  const setLoading = useCallback(
    (value: boolean) => setAudioState({ ...audioState, loading: value }),
    [audioState, setAudioState]
  );

  return {
    source: audioState.source,
    songIndex: audioState.songIndex,
    playlist: audioState.playlist,
    playing: audioState.playing,
    loading: audioState.loading,
    play,
    togglePause,
    nextSong,
    setLoading
  };
};

interface Props {
  children: React.ReactChild;
}

const AudioProvider = ({ children }: Props) => {
  const [audioState, setAudioState] = useState<AudioState>({
    playing: false,
    loading: false,
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
