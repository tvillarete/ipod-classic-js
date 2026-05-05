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

/**
 * If no scroll tick fires within this window, velocity resets to zero.
 * Matches Rockbox's WHEEL_FAST_OFF_TIMEOUT (250ms).
 */
export const VELOCITY_TIMEOUT_MS = 250;

/**
 * Velocity-to-skip mapping thresholds (velocity units: ticks/second).
 * At moderate spin (~6-7 ticks/sec) we start skipping 2-4 items.
 * At fast spin (~12+ ticks/sec) we skip up to 8 items per tick.
 */
export const VELOCITY_SKIP_THRESHOLDS = [
  { minVelocity: 0, skip: 1 },
  { minVelocity: 6, skip: 3 },
  { minVelocity: 10, skip: 5 },
  { minVelocity: 14, skip: 8 },
];