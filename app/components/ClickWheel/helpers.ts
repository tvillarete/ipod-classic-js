import { ANGLE_OFFSET_THRESHOLD } from "./constants";
import { ScrollDirection } from "./sharedTypes";

/**
 * Converts a regular bounding rect into a circular bounding rect.
 * This is useful for calculating the angle between the center of the circle and a point.
 */
export const getCircularBoundingInfo = (rect: DOMRect) => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const radius = Math.max(rect.width, rect.height) / 2;

  return {
    radius,
    diameter: radius * 2,
    centerPoint: { x: centerX, y: centerY },
  };
};

/**
 * Takes two points and returns the angle between them in degrees.
 */
export const getAngleBetweenPoints = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) => {
  return Math.round(
    (Math.atan2(point1.y - point2.y, point1.x - point2.x) * 180) / Math.PI
  );
};

/**
 * Returns true if the point is within an element, and false otherwise.
 */
export const checkIsPointWithinElement = (
  point: { x: number; y: number },
  element: HTMLElement | null | undefined
) => {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
};

export const getScrollDirection = (angleDelta: number): ScrollDirection => {
  // Upon making a full 360 degree rotation, the delta between the two angles will be very high.
  // We reverse the check for this single scroll tick.
  if (Math.abs(angleDelta) > ANGLE_OFFSET_THRESHOLD * 2) {
    return angleDelta > 0 ? "counter-clockwise" : "clockwise";
  }

  return angleDelta > 0 ? "clockwise" : "counter-clockwise";
};
