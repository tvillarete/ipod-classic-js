import { useCallback, useRef, useState } from 'react';
import { IpodEvent } from 'utils/events';

import { useAudioPlayer, useEffectOnce, useEventListener } from '../';

interface VolumeHandlerHook {
  volume: number;
  active: boolean;
  setEnabled: (val: boolean) => void;
}

const useVolumeHandler = (): VolumeHandlerHook => {
  const { volume, setVolume } = useAudioPlayer();
  const [active, setActive] = useState(false);
  const [enabled, setIsEnabled] = useState(true);
  const timeoutIdRef = useRef<any>();

  useEffectOnce(() => {
    /** clear the timeout to prevent memory leaks. */
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  });

  /** This is used to disable and reset the "active" timeout. */
  const setEnabled = useCallback((val: boolean) => {
    if (!val && timeoutIdRef.current) {
      setActive(false);
      setIsEnabled(false);
      clearTimeout(timeoutIdRef.current);
    } else {
      setActive(false);
      setIsEnabled(true);
      clearTimeout(timeoutIdRef.current);
    }
  }, []);

  /** The volume bar is "active" for 3 seconds after the last volume update. */
  const setActiveState = useCallback(() => {
    if (!enabled) return;

    setActive(true);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setActive(false);
    }, 3000);
  }, [enabled]);

  const increaseVolume = useCallback(() => {
    setActiveState();
    if (volume === 1 || !enabled) return;

    const newVolume = Math.min(volume + 0.04, 1);

    setVolume(newVolume);
  }, [setActiveState, volume, enabled, setVolume]);

  const decreaseVolume = useCallback(() => {
    setActiveState();
    if (!enabled) return;

    const newVolume = Math.max(volume - 0.04, 0.01);

    setVolume(newVolume);
  }, [setActiveState, volume, enabled, setVolume]);

  useEventListener<IpodEvent>('forwardscroll', increaseVolume);
  useEventListener<IpodEvent>('backwardscroll', decreaseVolume);
  /** Don't mistake a scroll for a click. */
  useEventListener<IpodEvent>('wheelclick', () => setActive(false));

  return {
    setEnabled,
    volume,
    active,
  };
};

export default useVolumeHandler;
