import { useEffect } from 'react';

const useMKEventListener = (
  event: keyof typeof MusicKit.Events,
  callback: (...args: any) => void
) => {
  const musicKit = window.MusicKit;

  useEffect(() => {
    const music = musicKit.getInstance();

    music.addEventListener(event, callback);

    return () => {
      music.removeEventListener(event, callback);
    };
  }, [callback, event, musicKit]);
};

export default useMKEventListener;
