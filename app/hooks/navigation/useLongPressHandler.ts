import { useCallback, useRef, useState } from "react";

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

  const handleClearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
  }, []);

  const handlePointerDown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      wasLongPressActivated.current = true;
      onLongPress();
    }, longPressThreshold);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (wasLongPressActivated.current) {
      wasLongPressActivated.current = false;
    } else {
      onPress();
    }
    handleClearTimeout();
  }, []);

  const handlePointerCancel = useCallback(() => {
    handleClearTimeout();
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };
};
