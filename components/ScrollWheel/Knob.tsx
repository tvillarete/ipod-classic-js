import React, { SyntheticEvent, useEffect, useRef } from 'react';

import { useEffectOnce, useSettings } from 'hooks';
import styled from 'styled-components';

import { DeviceThemeName, getTheme } from '../../utils/themes';
import FastForwardIcon from './icons/FastForwardIcon';
import MenuIcon from './icons/MenuIcon';
import PlayPauseIcon from './icons/PlayPauseIcon';
import RewindIcon from './icons/RewindIcon';

const Container = styled.div`
  user-select: none;
  position: relative;
  display: flex;
  justify-content: center;
  margin: auto 0;
  touch-action: none;
  transform: translate3d(0, 0, 0);
`;

const CanvasContainer = styled.div<{ width: number; height: number }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const Canvas = styled.canvas<{ deviceTheme: DeviceThemeName }>`
  border-radius: 50%;
  border: 1px solid ${({ deviceTheme }) => getTheme(deviceTheme).knob.outline};
  background: ${({ deviceTheme }) => getTheme(deviceTheme).knob.background};
`;

const CenterButton = styled.div<{ size: number; deviceTheme: DeviceThemeName }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: ${(props) => props.size / 2.5}px;
  height: ${(props) => props.size / 2.5}px;
  border-radius: 50%;
  box-shadow: ${({ deviceTheme }) =>
    getTheme(deviceTheme).knob.centerButton.boxShadow}
    0px 1em 3em inset;
  background: ${({ deviceTheme }) =>
    getTheme(deviceTheme).knob.centerButton.background};
  border: 1px solid
    ${({ deviceTheme }) => getTheme(deviceTheme).knob.centerButton.outline}};

  :active {
    filter: brightness(0.9);
  }
`;

/** Custom Event from https://github.com/john-doherty/long-press-event  */
interface LongPressEvent extends SyntheticEvent {
  detail: {
    clientX: number;
    clientY: number;
  };
}

const ANGLE_ARC = (360 * Math.PI) / 180;
const ANGLE_OFFSET = (0 * Math.PI) / 180;
const START_ANGLE = 1.5 * Math.PI + ANGLE_OFFSET;
const END_ANGLE = 1.5 * Math.PI + ANGLE_OFFSET + ANGLE_ARC;

type Props = {
  value: number;
  onChange: (value: number) => void;
  onClick?: (e: React.MouseEvent) => void;
  onLongPress?: (e: Event) => void;
  onMenuLongPress?: (e: Event) => void;
  onWheelClick?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: number;
  height?: number;
  thickness?: number;
  bgColor?: string;
  fgColor?: string;
  className?: string;
  canvasClassName?: string;
};

const Knob = ({
  value,
  onChange,
  onChangeEnd = () => {},
  onWheelClick = () => {},
  onClick = () => {},
  onLongPress = () => {},
  onMenuLongPress = () => {},
  min = 0,
  max = 100,
  step = 1,
  width = 200,
  height = 200,
  thickness = 0.35,
  bgColor = '#EEE',
  fgColor = '#EA2',
  className,
  canvasClassName,
}: Props) => {
  const { deviceTheme } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | undefined>();
  const centerButtonRef = useRef<HTMLDivElement | undefined>();

  const handleLongPress = (event: Event) => {
    event.preventDefault();
    (event.target as any).setAttribute('longpress', new Date().getTime());
    onLongPress(event);
    return false;
  };

  const handleMenuLongPress = (event: Event) => {
    onMenuLongPress(event);
  };

  const handleWheelLongPress = (event: LongPressEvent) => {
    event.preventDefault();
    (event.target as any).setAttribute('longpress', new Date().getTime());

    const rect = (event.target as Element).getBoundingClientRect();
    const x = event.detail.clientX - rect.left;
    const y = event.detail.clientY - rect.top;
    console.log({ x, y });
    const rectWidth = rect.width;
    const quadrant = findClickQuadrant(rectWidth, x, y);

    if (quadrant === 1) {
      handleMenuLongPress(event as any);
    }
  };

  const getArcToValue = (v: number) => {
    const angle = ((v - min) * ANGLE_ARC) / (max - min);
    const startAngle = START_ANGLE - 0.00001;
    const endAngle = startAngle + angle + 0.00001;

    return {
      startAngle,
      endAngle,
      acw: false,
    };
  };

  const getCanvasScale = (ctx: CanvasRenderingContext2D) => {
    const devicePixelRatio =
      window.devicePixelRatio ||
      (window.screen as any).deviceXDPI / (window.screen as any).logicalXDPI || // IE 11
      1;

    const backingStoreRatio = (ctx as any).webkitBackingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  };

  const coerceToStep = (v: number) => {
    let val = ~~((v < 0 ? -0.5 : 0.5) + v / step) * step;
    val = Math.max(Math.min(val, max), min);
    if (isNaN(val)) {
      val = 0;
    }
    return Math.round(val * 1000) / 1000;
  };

  const eventToValue = (e: any) => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) {
      return 0;
    }
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    let a = Math.atan2(x - width / 2, width / 2 - y) - ANGLE_OFFSET;
    if (ANGLE_ARC !== Math.PI * 2 && a < 0 && a > -0.5) {
      a = 0;
    } else if (a < 0) {
      a += Math.PI * 2;
    }
    const val = (a * (max - min)) / ANGLE_ARC + min;
    return coerceToStep(val);
  };

  const handleMouseDown = (e: Event) => {
    onChange(eventToValue(e));
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUpNoMove);
  };

  const handleTouchStart = (e: Event) => {
    onChange(eventToValue(e));
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEndNoMove);
    document.removeEventListener('mousedown', handleMouseDown);
  };

  const handleMouseMove = (e: Event) => {
    e.preventDefault();
    const val = eventToValue(e);

    if (val !== value) {
      onChange(eventToValue(e));
    }

    document.removeEventListener('mouseup', handleMouseUpNoMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchMove = (e: Event) => {
    e.preventDefault();
    const touchEvent = e as TouchEvent;
    const touchIndex = touchEvent.targetTouches.length - 1;
    const val = eventToValue(touchEvent.targetTouches[touchIndex]);

    if (val !== value) {
      onChange(val);
    }

    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.removeEventListener(
      'long-press',
      handleWheelLongPress as any
    );
    document.removeEventListener('touchend', handleTouchEndNoMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseUp = (e: Event) => {
    onChangeEnd(eventToValue(e));
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = (e: Event) => {
    const touchEvent = e as TouchEvent;
    const touchIndex = touchEvent.targetTouches.length - 1;
    onChangeEnd(touchEvent.targetTouches[touchIndex] as any);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.addEventListener(
      'long-press',
      handleWheelLongPress as any
    );
  };

  const findClickQuadrant = (rectSize: number, x: number, y: number) => {
    if (y < rectSize / 4) {
      return 1;
    } else if (y > rectSize * 0.75) {
      return 2;
    } else if (x < rectSize / 4) {
      return 3;
    } else if (x > rectSize * 0.75) {
      return 4;
    }
    return -1;
  };

  const handleMouseUpNoMove = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    const rect = (mouseEvent.target as Element).getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    const rectWidth = rect.width;
    const quadrant = findClickQuadrant(rectWidth, x, y);
    if (quadrant > 0 && quadrant <= 4) {
      onWheelClick(quadrant);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseup', handleMouseUpNoMove);
  };

  const handleTouchEndNoMove = (e: Event) => {
    const touchEvent = e as TouchEvent;
    const rect = (touchEvent.target as Element).getBoundingClientRect();
    const touch =
      touchEvent.changedTouches[touchEvent.changedTouches.length - 1];
    const x = touch.pageX - rect.left;
    const y = touch.pageY - rect.top;
    const rectWidth = rect.width;
    const quadrant = findClickQuadrant(rectWidth, x, y);

    if (quadrant > 0 && quadrant <= 4) {
      onWheelClick(quadrant);
    }

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchend', handleTouchEndNoMove);
  };

  const drawCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d')!;
    const scale = getCanvasScale(ctx);
    canvasRef.current.width = width * scale; // clears the canvas
    canvasRef.current.height = height * scale;
    ctx.scale(scale, scale);
    const xy = width / 2; // coordinates of canvas center
    const lineWidth = xy * thickness;
    const radius = xy - lineWidth / 2;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    // background arc
    ctx.beginPath();
    ctx.strokeStyle = bgColor;
    ctx.arc(xy, xy, radius, END_ANGLE - 0.00001, START_ANGLE + 0.00001, true);
    ctx.stroke();
    // foreground arc
    const a = getArcToValue(value);
    ctx.beginPath();
    ctx.strokeStyle = fgColor;
    ctx.arc(xy, xy, radius, a.startAngle, a.endAngle, a.acw);
    ctx.stroke();
  };

  // Component Did Mount
  useEffectOnce(() => {
    if (!canvasRef.current || !centerButtonRef.current) {
      console.error("Things didn't mount properly!");
      return;
    }

    const isTouchEnabled =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    drawCanvas();
    if (isTouchEnabled) {
      canvasRef.current.addEventListener('touchstart', handleTouchStart);
    } else {
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
    }
    centerButtonRef.current.addEventListener('long-press', handleLongPress);

    canvasRef.current.addEventListener(
      'long-press',
      handleWheelLongPress as any
    );

    // Component Will Unmount
    return () => {
      if (!canvasRef.current || !centerButtonRef.current) {
        console.error("Things didn't mount properly!");
        return;
      }

      if (isTouchEnabled) {
        canvasRef.current.removeEventListener('touchstart', handleTouchStart);
      } else {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      centerButtonRef.current.removeEventListener(
        'long-press',
        handleLongPress
      );
      canvasRef.current.removeEventListener(
        'long-press',
        handleWheelLongPress as any
      );
    };
  });

  // Component Did Update
  useEffect(() => {
    drawCanvas();
  });

  const buttonColor = getTheme(deviceTheme).knob.button;

  return (
    <Container className={className}>
      <CanvasContainer width={width} height={height}>
        <Canvas
          ref={(ref) => {
            canvasRef.current = ref ?? undefined;
          }}
          className={canvasClassName}
          style={{ width: '100%', height: '100%' }}
          deviceTheme={deviceTheme}
        />

        <CenterButton
          ref={(ref) => {
            centerButtonRef.current = ref ?? undefined;
          }}
          onClick={onClick}
          size={width}
          deviceTheme={deviceTheme}
        />
        <MenuIcon top={'8%'} margin={'0 auto'} color={buttonColor} />
        <PlayPauseIcon bottom={'8%'} margin={'0 auto'} color={buttonColor} />
        <RewindIcon left={'8%'} margin={'auto 0'} color={buttonColor} />
        <FastForwardIcon right={'8%'} margin={'auto 0'} color={buttonColor} />
      </CanvasContainer>
    </Container>
  );
};

export default Knob;
