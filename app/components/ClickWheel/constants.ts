/**
 * The threshold in degrees that the user must scroll before the knob
 * registers a change in value.
 */
export const ANGLE_OFFSET_THRESHOLD = 15;

/**
 * Touch inputs use a higher threshold to match the iPod Nano's sensitivity,
 * since the wheel renders smaller on mobile just like the Nano's physical wheel.
 */
export const TOUCH_ANGLE_OFFSET_THRESHOLD = 23;

/**
 * The threshold in pixels that the user must pan before we consider the input a pan.
 */
export const PAN_THRESHOLD = 5;

/**
 * Touch inputs need a more forgiving threshold since fingers naturally drift
 * more than a mouse cursor, causing accidental button presses during scrolling.
 */
export const TOUCH_PAN_THRESHOLD = 15;