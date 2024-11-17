import React, { useCallback, useRef } from "react";

import styled, { css } from "styled-components";

import FastForwardIcon from "./icons/FastForwardIcon";
import MenuIcon from "./icons/MenuIcon";
import PlayPauseIcon from "./icons/PlayPauseIcon";
import RewindIcon from "./icons/RewindIcon";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import {
  checkIsPointWithinElement,
  getAngleBetweenPoints,
  getCircularBoundingInfo,
  getScrollDirection,
} from "./helpers";
import { DeviceThemeName, getTheme } from "utils/themes";
import { useEventListener, useSettings } from "hooks";
import {
  dispatchBackClickEvent,
  dispatchCenterClickEvent,
  dispatchCenterLongClickEvent,
  dispatchForwardClickEvent,
  dispatchKeyboardEvent,
  dispatchMenuClickEvent,
  dispatchPlayPauseClickEvent,
  dispatchScrollEvent,
} from "utils/events";
import { useLongPressHandler } from "hooks/navigation/useLongPressHandler";
import { Screen } from "utils/constants";
import { ANGLE_OFFSET_THRESHOLD, PAN_THRESHOLD } from "./constants";

type RootContainerProps = {
  $deviceTheme: DeviceThemeName;
  size?: number;
};

const RootContainer = styled(motion.div)<RootContainerProps>`
  display: grid;
  position: relative;
  border-radius: 50%;
  touch-action: none;

  ${({ size = 220, $deviceTheme }) => css`
    width: ${size}px;
    height: ${size}px;
    background-color: ${getTheme($deviceTheme).clickwheel.background};
    border: 1px solid ${getTheme($deviceTheme).clickwheel.centerButton.outline};

    ${Screen.XS.MediaQuery} {
      width: ${size * 0.8}px;
      height: ${size * 0.8}px;
    }
  `}
`;

const ButtonContainer = styled.div<{
  $placement: string;
}>`
  position: absolute;
  place-self: ${(props) => props.$placement};
  padding: 12px;
`;

type CenterButtonProps = {
  $deviceTheme: DeviceThemeName;
  size: number;
};

const CenterButton = styled.div<CenterButtonProps>`
  user-select: none;
  border-radius: 50%;

  ${({ $deviceTheme, size }) => css`
    width: ${size}px;
    height: ${size}px;
    border: 1px solid ${getTheme($deviceTheme).clickwheel.centerButton.outline};
    background: ${getTheme($deviceTheme).clickwheel.centerButton.background};
    box-shadow: ${getTheme($deviceTheme).clickwheel.centerButton.boxShadow} 0px
      1em 3em inset;
  `}

  &:active {
    opacity: 0.8;
  }
`;

/**
 * The ClickWheel component is a circular input that allows the user to interact with the iPod.
 * It contains four buttons: Menu, Rewind, Fast Forward, and Play/Pause.
 *
 * This component dispatches events based on the user's interactions with the ClickWheel
 * which can be listened to by other components.
 */
export const ClickWheel = () => {
  const { deviceTheme } = useSettings();
  const iconColor = getTheme(deviceTheme).clickwheel.button;

  const rootContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const rewindButtonRef = useRef<HTMLDivElement>(null);
  const fastForwardButtonRef = useRef<HTMLDivElement>(null);
  const playPauseButtonRef = useRef<HTMLDivElement>(null);

  const isPanningMotionValue = useMotionValue(false);
  const startPointMotionValue = useMotionValue({
    x: 0,
    y: 0,
  });

  const handleWheelPress = useCallback((point: { x: number; y: number }) => {
    if (checkIsPointWithinElement(point, menuButtonRef.current)) {
      dispatchMenuClickEvent();
    } else if (checkIsPointWithinElement(point, rewindButtonRef.current)) {
      dispatchBackClickEvent();
    } else if (checkIsPointWithinElement(point, fastForwardButtonRef.current)) {
      dispatchForwardClickEvent();
    } else if (checkIsPointWithinElement(point, playPauseButtonRef.current)) {
      dispatchPlayPauseClickEvent();
    }
  }, []);

  const handlePan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (!rootContainerRef.current) {
        return;
      }

      const { centerPoint } = getCircularBoundingInfo(
        rootContainerRef.current.getBoundingClientRect()
      );
      const startPoint = startPointMotionValue.get();
      const currentPoint = info.point;

      const startAngleDeg = getAngleBetweenPoints(startPoint, centerPoint);
      const currentAngleDeg = getAngleBetweenPoints(currentPoint, centerPoint);
      const angleDelta = currentAngleDeg - startAngleDeg;
      const direction = getScrollDirection(angleDelta);

      // If the user has panned more than the angle offset threshold, we trigger a scroll event
      const hasScrolled = Math.abs(angleDelta) > ANGLE_OFFSET_THRESHOLD;

      if (hasScrolled) {
        // Reset the start point to the current point to begin tracking the next scroll
        startPointMotionValue.set(currentPoint);

        dispatchScrollEvent(direction);
      }
    },
    [startPointMotionValue]
  );

  const handlePanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      const deltaX = info.offset.x;
      const deltaY = info.offset.y;

      const isPressEvent =
        // If the user has panned but returned their cursor to near the starting position, don't trigger a press event.
        !isPanningMotionValue.get() &&
        // If the user has scrolled less than the pan threshold, we consider it a press event
        Math.abs(deltaX) < PAN_THRESHOLD &&
        Math.abs(deltaY) < PAN_THRESHOLD;

      if (isPressEvent) {
        handleWheelPress({
          x: event.clientX,
          y: event.clientY,
        });
      }

      isPanningMotionValue.set(false);
    },
    [handleWheelPress, isPanningMotionValue]
  );

  const handlePanStart = useCallback(
    (event: PointerEvent) => {
      isPanningMotionValue.set(true);

      startPointMotionValue.set({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [isPanningMotionValue, startPointMotionValue]
  );

  const handlePress = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // If the user is panning, we ignore the press event
      if (isPanningMotionValue.get()) {
        return;
      }

      handleWheelPress({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [handleWheelPress, isPanningMotionValue]
  );

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) =>
      dispatchKeyboardEvent(event.key),
    []
  );

  const handleCenterButtonPress = useCallback(() => {
    // If the user is panning and ends on the center button, we ignore the press event.
    if (isPanningMotionValue.get()) {
      return;
    }

    dispatchCenterClickEvent();
  }, [isPanningMotionValue]);

  const handleCenterButtonLongPress = useCallback(() => {
    dispatchCenterLongClickEvent();
  }, []);

  useEventListener("keydown", handleKeyPress);

  const { ...longPressHandlerProps } = useLongPressHandler({
    onPress: handleCenterButtonPress,
    onLongPress: handleCenterButtonLongPress,
  });

  return (
    <RootContainer
      $deviceTheme={deviceTheme}
      onClick={handlePress}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      ref={rootContainerRef}
    >
      <ButtonContainer ref={menuButtonRef} $placement="start center">
        <MenuIcon color={iconColor} />
      </ButtonContainer>
      <ButtonContainer ref={rewindButtonRef} $placement="center start">
        <RewindIcon color={iconColor} />
      </ButtonContainer>
      <ButtonContainer $placement="center">
        <CenterButton
          size={90}
          $deviceTheme={deviceTheme}
          {...longPressHandlerProps}
        />
      </ButtonContainer>
      <ButtonContainer ref={fastForwardButtonRef} $placement="center end">
        <FastForwardIcon color={iconColor} />
      </ButtonContainer>
      <ButtonContainer ref={playPauseButtonRef} $placement="end center">
        <PlayPauseIcon color={iconColor} />
      </ButtonContainer>
    </RootContainer>
  );
};
