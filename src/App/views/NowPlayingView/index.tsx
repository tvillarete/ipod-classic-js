import React, { useEffect } from "react";
import { Song, useAudioService } from "services/audio";

interface Props {
  song: Song;
}

const NowPlayingView = ({ song }: Props) => {
  const { source } = useAudioService();
  // const [index] = useScrollHandler(ViewIds.nowPlaying, options);
  useEffect(() => {}, []);

  return <h3>Now Playing: {source?.name}</h3>;
};

export default NowPlayingView;
