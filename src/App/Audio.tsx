import React, { useRef, useEffect, useCallback } from "react";
import { useAudioService } from "services/audio";

const Audio = () => {
  const { source, playing, nextSong, loading, setLoading } = useAudioService();
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

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (playing && audioRef.current && !loading) {
      handlePlay();
    } else if (!playing && audioRef.current && audioRef.current.src) {
      handlePause();
    }
  }, [handlePause, handlePlay, loading, playing]);

  return source ? (
    <audio
      ref={audioRef}
      id="ipodAudio"
      onLoadStart={handleLoadStart}
      onCanPlay={handleLoadEnd}
      onEnded={nextSong}
      src={`http://tannerv.ddns.net:12345/SpotiFree/${encodeURI(source.url)}`}
    />
  ) : null;
};

export default Audio;
