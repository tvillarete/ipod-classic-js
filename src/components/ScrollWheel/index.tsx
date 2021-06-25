import { useCallback, useRef, useState } from 'react';

import { useEffectOnce, useEventListener, useSettings } from 'hooks';

import Knob from './Knob';
import { createIpodEvent } from 'utils/events';
import { getTheme } from '../../utils/themes';

enum WHEEL_QUADRANT {
  TOP = 1,
  BOTTOM = 2,
  LEFT = 3,
  RIGHT = 4,
}

type SupportedKeyCode =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Escape'
  | 'Enter'
  | ' '
  | 'Spacebar';

const centerClickEvent = createIpodEvent('centerclick');
const centerLongClickEvent = createIpodEvent('centerlongclick');
const forwardScrollEvent = createIpodEvent('forwardscroll');
const backwardScrollEvent = createIpodEvent('backwardscroll');
const wheelClickEvent = createIpodEvent('wheelclick');
const menuClickEvent = createIpodEvent('menuclick');
const menuLongPressEvent = createIpodEvent('menulongpress');
const backClickEvent = createIpodEvent('backwardclick');
const forwardClickEvent = createIpodEvent('forwardclick');
const playPauseClickEvent = createIpodEvent('playpauseclick');
const idleEvent = createIpodEvent('idle');

const ScrollWheel = () => {
  const { deviceTheme } = useSettings();
  const [count, setCount] = useState(0);
  const timeoutIdRef = useRef<any>();

  const handleCenterClick = useCallback(
    () => window.dispatchEvent(centerClickEvent),
    []
  );

  const handleCenterLongPress = useCallback((e: any) => {
    e.preventDefault();
    window.dispatchEvent(centerLongClickEvent);
  }, []);

  const handleMenuLongPress = useCallback((e: any) => {
    e.preventDefault();
    window.dispatchEvent(menuLongPressEvent);
  }, []);

  const handleClockwiseScroll = useCallback(
    () => window.dispatchEvent(forwardScrollEvent),
    []
  );

  const handleCounterClockwiseScroll = useCallback(() => {
    window.dispatchEvent(backwardScrollEvent);
  }, []);

  const handleResetIdleCheck = useCallback(() => {
    clearTimeout(timeoutIdRef.current);

    timeoutIdRef.current = setTimeout(() => {
      window.dispatchEvent(idleEvent);
    }, 10000);
  }, []);

  const handleWheelClick = useCallback(
    (quadrant: number) => {
      window.dispatchEvent(wheelClickEvent);

      switch (quadrant) {
        case WHEEL_QUADRANT.TOP:
          window.dispatchEvent(menuClickEvent);
          break;
        case WHEEL_QUADRANT.BOTTOM:
          window.dispatchEvent(playPauseClickEvent);
          break;
        case WHEEL_QUADRANT.LEFT:
          window.dispatchEvent(backClickEvent);
          break;
        case WHEEL_QUADRANT.RIGHT:
          window.dispatchEvent(forwardClickEvent);
          break;
      }

      handleResetIdleCheck();
    },
    [handleResetIdleCheck]
  );

  /** Allows for keyboard navigation. */
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key as SupportedKeyCode) {
        case 'ArrowUp':
        case 'ArrowLeft':
          handleCounterClockwiseScroll();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          handleClockwiseScroll();
          break;
        case 'Enter':
          handleCenterClick();
          break;
        case ' ':
        case 'Spacebar':
          handleWheelClick(WHEEL_QUADRANT.BOTTOM);
          break;
        case 'Escape':
          handleWheelClick(WHEEL_QUADRANT.TOP);
          break;
      }

      handleResetIdleCheck();
    },
    [
      handleResetIdleCheck,
      handleCounterClockwiseScroll,
      handleClockwiseScroll,
      handleCenterClick,
      handleWheelClick,
    ]
  );

  /** Determine if clockwise/counter-clockwise based on the Knob onChange value. */
  const handleScroll = useCallback(
    (val: number) => {
      setCount((currentCount) => {
        if (val === 5 && currentCount === 100) {
          handleClockwiseScroll();
        } else if (val === 100 && currentCount === 5) {
          handleCounterClockwiseScroll();
        } else if (val > currentCount) {
          handleClockwiseScroll();
        } else if (val < currentCount) {
          handleCounterClockwiseScroll();
        }
        return val;
      });

      handleResetIdleCheck();
    },
    [handleClockwiseScroll, handleCounterClockwiseScroll, handleResetIdleCheck]
  );

  useEventListener('keydown', handleKeyPress);

  /**
   * Start the countdown for detecting when the user is idle,
   * in which case we'll show the Now Playing view if music is playing
   */
  useEffectOnce(handleResetIdleCheck);

  return (
    <Knob
      value={count}
      min={0}
      max={100}
      width={220}
      height={220}
      step={5}
      fgColor="transparent"
      bgColor={getTheme(deviceTheme).knob.background}
      thickness={0.6}
      onClick={handleCenterClick}
      onLongPress={handleCenterLongPress}
      onMenuLongPress={handleMenuLongPress}
      onWheelClick={handleWheelClick}
      onChange={handleScroll}
    />
  );
};

export default ScrollWheel;
