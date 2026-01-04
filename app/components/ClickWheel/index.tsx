import React, { useCallback, useMemo, useRef } from "react";

import styled, { css } from "styled-components";

import FastForwardIcon from "./icons/FastForwardIcon";
import MenuIcon from "./icons/MenuIcon";
import PlayPauseIcon from "./icons/PlayPauseIcon";
import RewindIcon from "./icons/RewindIcon";
import { motion, PanInfo } from "framer-motion";
import {
  checkIsPointWithinElement,
  getAngleBetweenPoints,
  getCircularBoundingInfo,
  getScrollDirection,
} from "./helpers";
import { DeviceThemeName, getTheme } from "@/utils/themes";
import { useEventListener, useSettings } from "@/hooks";
import {
  dispatchBackClickEvent,
  dispatchCenterClickEvent,
  dispatchCenterLongClickEvent,
  dispatchForwardClickEvent,
  dispatchKeyboardEvent,
  dispatchMenuClickEvent,
  dispatchMenuLongPressEvent,
  dispatchPlayPauseClickEvent,
  dispatchScrollEvent,
} from "@/utils/events";
import { useLongPressHandler } from "@/hooks/navigation/useLongPressHandler";
import { Screen } from "@/utils/constants";
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

  /* Prevent text selection and context menus on touch devices */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

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

  /* Prevent text selection and touch callouts on long press */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
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

// Extract constant for center button size
const CENTER_BUTTON_SIZE = 90;

/**
 * The ClickWheel component is a circular input that allows the user to interact with the iPod.
 * It contains four buttons: Menu, Rewind, Fast Forward, and Play/Pause.
 *
 * This component dispatches events based on the user's interactions with the ClickWheel
 * which can be listened to by other components.
 */
export const ClickWheel = () => {
  const { deviceTheme } = useSettings();

  const iconColor = useMemo(
    () => getTheme(deviceTheme).clickwheel.button,
    [deviceTheme]
  );

  const rootContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const rewindButtonRef = useRef<HTMLDivElement>(null);
  const fastForwardButtonRef = useRef<HTMLDivElement>(null);
  const playPauseButtonRef = useRef<HTMLDivElement>(null);

  const hasScrolledRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });

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

  const handlePan = useCallback((_: PointerEvent, info: PanInfo) => {
    if (!rootContainerRef.current) {
      return;
    }

    const { centerPoint } = getCircularBoundingInfo(
      rootContainerRef.current.getBoundingClientRect()
    );
    const startPoint = startPointRef.current;
    const currentPoint = info.point;

    const startAngleDeg = getAngleBetweenPoints(startPoint, centerPoint);
    const currentAngleDeg = getAngleBetweenPoints(currentPoint, centerPoint);
    const angleDelta = currentAngleDeg - startAngleDeg;
    const direction = getScrollDirection(angleDelta);

    // If the user has panned more than the angle offset threshold, we trigger a scroll event
    const hasScrolled = Math.abs(angleDelta) > ANGLE_OFFSET_THRESHOLD;

    if (hasScrolled) {
      // Mark that we actually scrolled during this pan gesture
      hasScrolledRef.current = true;

      // Reset the start point to the current point to begin tracking the next scroll
      startPointRef.current = currentPoint;

      dispatchScrollEvent(direction);
    }
  }, []);

  const handlePanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      const deltaX = info.offset.x;
      const deltaY = info.offset.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      const isPressEvent = !hasScrolledRef.current && distance < PAN_THRESHOLD;

      if (isPressEvent) {
        handleWheelPress({
          x: event.clientX,
          y: event.clientY,
        });
      }

      // Reset scroll tracking for the next pan gesture
      // Use a timeout to prevent click events from firing immediately after pan
      setTimeout(() => {
        hasScrolledRef.current = false;
      }, 50);
    },
    [handleWheelPress]
  );

  const handlePanStart = useCallback((event: PointerEvent) => {
    startPointRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handlePress = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // If the user just scrolled, ignore the click event that might follow
      if (hasScrolledRef.current) {
        return;
      }

      handleWheelPress({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [handleWheelPress]
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => dispatchKeyboardEvent(event.key),
    []
  );

  const handleCenterButtonPress = useCallback(() => {
    // If the user scrolled during a pan gesture, don't trigger a press event
    if (hasScrolledRef.current) {
      return;
    }

    dispatchCenterClickEvent();
  }, []);

  const handleCenterButtonLongPress = useCallback(() => {
    dispatchCenterLongClickEvent();
  }, []);

  const handleMenuButtonPress = useCallback(() => {
    // If the user scrolled during a pan gesture, don't trigger a press event
    if (hasScrolledRef.current) {
      return;
    }

    dispatchMenuClickEvent();
  }, []);

  const handleMenuButtonLongPress = useCallback(() => {
    // If the user scrolled, don't trigger the long press event
    if (hasScrolledRef.current) {
      return;
    }

    dispatchMenuLongPressEvent();
  }, []);

  useEventListener("keydown", handleKeyPress);

  const longPressHandlerProps = useLongPressHandler({
    onPress: handleCenterButtonPress,
    onLongPress: handleCenterButtonLongPress,
  });

  const menuLongPressHandlerProps = useLongPressHandler({
    onPress: handleMenuButtonPress,
    onLongPress: handleMenuButtonLongPress,
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
      <ButtonContainer
        ref={menuButtonRef}
        $placement="start center"
        {...menuLongPressHandlerProps}
      >
        <MenuIcon color={iconColor} />
      </ButtonContainer>
      <ButtonContainer ref={rewindButtonRef} $placement="center start">
        <RewindIcon color={iconColor} />
      </ButtonContainer>
      <ButtonContainer $placement="center">
        <CenterButton
          size={CENTER_BUTTON_SIZE}
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
