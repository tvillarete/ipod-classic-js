import { useCallback, useRef, useState } from 'react';

import { useEffectOnce, useEventListener } from 'hooks';

import Knob from './Knob';

enum WHEEL_QUADRANT {
  TOP = 1,
  BOTTOM = 2,
  LEFT = 3,
  RIGHT = 4,
}

enum KEY_CODE {
  ARROW_UP = 38,
  ARROW_DOWN = 40,
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  ESC = 27,
  ENTER = 13,
  SPACE = 32,
}

const centerClickEvent = new Event('centerclick');
const centerLongClickEvent = new Event('centerlongclick');
const forwardScrollEvent = new Event('forwardscroll');
const backwardScrollEvent = new Event('backwardscroll');
const wheelClickEvent = new Event('wheelclick');
const menuClickEvent = new Event('menuclick');
const menuLongPressEvent = new Event('menulongpress');
const backClickEvent = new Event('backclick');
const forwardClickEvent = new Event('forwardclick');
const playPauseClickEvent = new Event('playpauseclick');
const idleEvent = new Event('idle');

const ScrollWheel = () => {
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
      switch (event.keyCode) {
        case KEY_CODE.ARROW_UP:
        case KEY_CODE.ARROW_LEFT:
          handleCounterClockwiseScroll();
          break;
        case KEY_CODE.ARROW_DOWN:
        case KEY_CODE.ARROW_RIGHT:
          handleClockwiseScroll();
          break;
        case KEY_CODE.ENTER:
          handleCenterClick();
          break;
        case KEY_CODE.SPACE:
          handleWheelClick(WHEEL_QUADRANT.BOTTOM);
          break;
        case KEY_CODE.ESC:
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
      if (val === 0 && count === 100) {
        handleClockwiseScroll();
      } else if (val === 100 && count === 0) {
        handleCounterClockwiseScroll();
      } else if (val > count) {
        handleClockwiseScroll();
      } else if (val < count) {
        handleCounterClockwiseScroll();
      }
      setCount(val);

      handleResetIdleCheck();
    },
    [
      count,
      handleClockwiseScroll,
      handleCounterClockwiseScroll,
      handleResetIdleCheck,
    ]
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
      bgColor={'white'}
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
