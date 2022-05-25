import { RefObject, useCallback, useEffect, useRef } from 'react';
import { DIRECTION_MAP } from '../utils/constants';
import { Vector } from '../utils/types';

const isTouchDevice = () => 'ontouchstart' in window;

// Similar to useArrowKeyPress, use callback to let hook user decide when to rerender
const useSwipe = <T extends HTMLElement>(
  ref: RefObject<T>,
  cb: (dir: Vector) => void,
  threshold = 3,
) => {
  const posRef = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback(({ changedTouches }: TouchEvent) => {
    posRef.current = {
      x: changedTouches[0].clientX,
      y: changedTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(
    ({ changedTouches }: TouchEvent) => {
      if (changedTouches?.length > 0) {
        const {
          current: { x, y },
        } = posRef;
        const cx = changedTouches[0].clientX;
        const cy = changedTouches[0].clientY;
        const dx = cx - x;
        const dy = cy - y;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          cb(cx > x ? DIRECTION_MAP.Right : DIRECTION_MAP.Left);
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
          cb(cy > y ? DIRECTION_MAP.Down : DIRECTION_MAP.Up);
        }
      }
    },
    [cb, threshold],
  );

  useEffect(() => {
    const el = ref.current;
    if (isTouchDevice()) {
      el?.addEventListener('touchstart', onTouchStart);
      el?.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      if (isTouchDevice()) {
        el?.removeEventListener('touchstart', onTouchStart);
        el?.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [onTouchEnd, onTouchStart, ref]);
};

export default useSwipe;
