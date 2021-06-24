const canUseHaptics = typeof navigator !== 'undefined' && 'vibrate' in navigator;

const useHapticFeedback = () => {
  const triggerHaptics = (pattern: number | number[]) => {
    if (!canUseHaptics) {
      return;
    }
    navigator.vibrate(pattern);
  }

  return {
    triggerHaptics
  }
}

export default useHapticFeedback;