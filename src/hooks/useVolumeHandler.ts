import { useState, useCallback, useRef, useEffect } from "react";
import useEventListener from "./useEventListener";

interface VolumeHandlerHook {
  volume: number;
  active: boolean;
  setEnabled: (val: boolean) => void;
}

const useVolumeHandler = (): VolumeHandlerHook => {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(100);
  const [enabled, setEnabled] = useState(true);
  const timeoutIdRef = useRef<any>();

  useEffect(() => {
    const audio = document.getElementById("ipodAudio") as HTMLAudioElement;

    setVolume(audio.volume * 100);

    /** clear the timeout to prevent memory leaks. */
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  /** The volume bar is "active" for 3 seconds after the last volume update. */
  const setActiveState = useCallback(() => {
    setActive(true);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setActive(false);
    }, 3000);
  }, []);

  const increaseVolume = useCallback(() => {
    if (volume === 100 || !enabled) return;
    const audio = document.getElementById("ipodAudio") as HTMLAudioElement;

    setActiveState();
    audio.volume = (volume + 4) / 100;
    setVolume(volume + 4);
  }, [volume, enabled, setActiveState]);

  const decreaseVolume = useCallback(() => {
    if (volume === 0 || !enabled) return;
    const audio = document.getElementById("ipodAudio") as HTMLAudioElement;

    setActiveState();
    audio.volume = (volume - 4) / 100;
    setVolume(volume - 4);
  }, [volume, enabled, setActiveState]);

  useEventListener("forwardscroll", increaseVolume);
  useEventListener("backwardscroll", decreaseVolume);
  /** Don't mistake a scroll for a click. */
  useEventListener("wheelclick", () => setActive(false));

  return {
    setEnabled,
    volume,
    active
  };
};

export default useVolumeHandler;
