import React, { useState, useCallback } from "react";
import Knob from "./Knob";
import { useWindowService } from "services/window";
import { useEventListener } from "hooks";
import { useAudioService } from "services/audio";

enum WHEEL_QUADRANT {
  TOP = 1,
  BOTTOM = 2,
  LEFT = 3,
  RIGHT = 4
}

enum KEY_CODE {
  ARROW_UP = 38,
  ARROW_DOWN = 40,
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  ESC = 27,
  ENTER = 13,
  SPACE = 32
}

const centerClickEvent = new Event("centerclick");
const forwardScrollEvent = new Event("forwardscroll");
const backwardScrollEvent = new Event("backwardscroll");
const wheelClickEvent = new Event("wheelclick");

const ScrollWheel = () => {
  const [count, setCount] = useState(0);
  const { hideWindow } = useWindowService();
  const { togglePause, nextSong } = useAudioService();

  const handleCenterClick = useCallback(
    () => window.dispatchEvent(centerClickEvent),
    []
  );

  const handleClockwiseScroll = useCallback(
    () => window.dispatchEvent(forwardScrollEvent),
    []
  );

  const handleCounterClockwiseScroll = useCallback(() => {
    window.dispatchEvent(backwardScrollEvent);
  }, []);

  const handleWheelClick = useCallback(
    (quadrant: number) => {
      window.dispatchEvent(wheelClickEvent);

      switch (quadrant) {
        case WHEEL_QUADRANT.TOP:
          hideWindow();
          break;
        case WHEEL_QUADRANT.BOTTOM:
          togglePause();
          break;
        case WHEEL_QUADRANT.LEFT:
          console.log("CLICKED REWIND");
          break;
        case WHEEL_QUADRANT.RIGHT:
          nextSong();
          break;
      }
    },
    [hideWindow, nextSong, togglePause]
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
          togglePause();
          break;
        case KEY_CODE.ESC:
          handleWheelClick(WHEEL_QUADRANT.TOP);
          break;
      }
    },
    [
      handleCounterClockwiseScroll,
      handleClockwiseScroll,
      handleCenterClick,
      togglePause,
      handleWheelClick
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
    },
    [count, handleClockwiseScroll, handleCounterClockwiseScroll]
  );

  useEventListener("keydown", handleKeyPress);

  return (
    <Knob
      value={count}
      min={0}
      max={100}
      width={220}
      height={220}
      step={5}
      fgColor="transparent"
      bgColor={"white"}
      thickness={0.6}
      onClick={handleCenterClick}
      onWheelClick={handleWheelClick}
      onChange={handleScroll}
    />
  );
};

export default ScrollWheel;
