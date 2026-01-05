import { useCallback, useMemo } from "react";
import { haptic } from "ios-haptics";
import { useSettings } from "@/hooks";

const canUseVibrate =
  typeof navigator !== "undefined" && "vibrate" in navigator;

/**
 * Provides haptic feedback for user interactions.
 *
 * Uses ios-haptics library for button clicks (iOS 17.4+ Taptic Engine with automatic
 * fallback to navigator.vibrate() on Android/older iOS).
 *
 * For scroll events, directly uses navigator.vibrate() since pan gestures don't trigger
 * the iOS checkbox-based haptics properly.
 */
const useHapticFeedback = () => {
  const { hapticsEnabled } = useSettings();

  const triggerHaptics = useCallback(
    (forceVibrate = false) => {
      // Check if haptics are enabled in settings
      if (!hapticsEnabled) {
        return;
      }

      if (forceVibrate) {
        // Use vibrate API directly for scroll events (pan gestures)
        // iOS checkbox haptics don't work during pan/swipe interactions
        if (canUseVibrate) {
          navigator.vibrate(10);
        }
        return;
      }

      // For button clicks: use ios-haptics (Taptic Engine on iOS 17.4+)
      // Library automatically falls back to navigator.vibrate() on other platforms
      haptic();
    },
    [hapticsEnabled]
  );

  const hooks = useMemo(
    () => ({
      triggerHaptics,
    }),
    [triggerHaptics]
  );

  return hooks;
};

export default useHapticFeedback;
