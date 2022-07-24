import { useEffect } from 'react';

/**
 * MusicKit has its own event listener logic that is attached to the `music` instance.
 * This hook allows us to use it anywhere via a hook, similar to useEventListener.
 */
const useMKEventListener = (
  event: keyof typeof MusicKit.Events,
  callback: (...args: any) => void
) => {
  useEffect(() => {
    const musicKit = window.MusicKit || undefined;

    if (!musicKit || musicKit.errors.length) {
      return;
    }

    const music = musicKit.getInstance();

    if (!music) {
      return;
    }

    music.addEventListener(event, callback);

    return () => {
      music.removeEventListener(event, callback);
    };
  }, [callback, event]);
};

export default useMKEventListener;
