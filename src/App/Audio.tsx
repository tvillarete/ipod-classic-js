import React, { useRef, useEffect, useCallback } from "react";
import { useAudioService } from "services/audio";

const Audio = () => {
  const { source, playing } = useAudioService();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused) {
      await audioRef.current.play();
    }
  }, []);

  const handlePause = useCallback(async () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  useEffect(() => {
    if (playing && audioRef.current) {
      handlePlay();
    } else if (!playing && audioRef.current && audioRef.current.src) {
      handlePause();
    }
  }, [handlePause, handlePlay, playing]);

  return source ? (
    <audio
      ref={audioRef}
      src={`http://tannerv.ddns.net:12345/SpotiFree/${encodeURI(source.url)}`}
    />
  ) : null;
};

export default Audio;
