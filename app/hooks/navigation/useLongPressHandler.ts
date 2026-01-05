import { useCallback, useRef } from "react";
import { useHapticFeedback } from "@/hooks";

const LONG_PRESS_THRESHOLD = 500;

export interface UseLongPressHandlerProps {
  onLongPress: () => void;
  onPress: () => void;
  longPressThreshold?: number;
}

export const useLongPressHandler = ({
  onPress,
  onLongPress,
  longPressThreshold = LONG_PRESS_THRESHOLD,
}: UseLongPressHandlerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasLongPressActivated = useRef(false);
  const { triggerHaptics } = useHapticFeedback();

  const handleClearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
  }, []);

  const handlePointerDown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      wasLongPressActivated.current = true;
      triggerHaptics(); // Trigger haptic when long press activates
      onLongPress();
    }, longPressThreshold);
  }, [longPressThreshold, onLongPress, triggerHaptics]);

  const handlePointerUp = useCallback(() => {
    if (wasLongPressActivated.current) {
      wasLongPressActivated.current = false;
    } else {
      onPress();
    }
    handleClearTimeout();
  }, [handleClearTimeout, onPress]);

  const handlePointerCancel = useCallback(() => {
    handleClearTimeout();
  }, [handleClearTimeout]);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };
};
