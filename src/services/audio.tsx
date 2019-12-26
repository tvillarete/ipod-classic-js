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
  play: (playlist: Song[], index?: number) => void;
  togglePause: () => void;
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

  return {
    source: audioState.source,
    songIndex: audioState.songIndex,
    playing: audioState.playing,
    play,
    togglePause
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
