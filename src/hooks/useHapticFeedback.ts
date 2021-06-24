import { useCallback, useMemo } from "react";

const canUseHaptics = typeof navigator !== 'undefined' && 'vibrate' in navigator;

const useHapticFeedback = () => {
  const triggerHaptics = useCallback((pattern: number | number[]) => {
    if (!canUseHaptics) {
      return;
    }
    navigator.vibrate(pattern);
  }, []);

  const hooks = useMemo(() => ({
    triggerHaptics
  }), [triggerHaptics]);

  return hooks;
}

export default useHapticFeedback;