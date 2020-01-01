import React, { useCallback, useEffect, useRef } from 'react';

import { useEventListener } from 'hooks';
import { useAudioService } from 'services/audio';

const Audio = () => {
  const {
    source,
    playing,
    nextSong,
    prevSong,
    loading,
    setLoading
  } = useAudioService();
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

  const handleBackClick = useCallback(() => {
    if (source && audioRef.current) {
      if (audioRef.current.currentTime < 3) {
        prevSong();
      } else {
        audioRef.current.currentTime = 0;
      }
    }
  }, [prevSong, source]);

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

  useEventListener("backclick", handleBackClick);

  return source ? (
    <audio
      ref={audioRef}
      id="ipodAudio"
      onLoadStart={handleLoadStart}
      onCanPlay={handleLoadEnd}
      onEnded={nextSong}
      src={`http://tannerv.ddns.net/SpotiFree/${encodeURI(source.url)}`}
    />
  ) : null;
};

export default Audio;
