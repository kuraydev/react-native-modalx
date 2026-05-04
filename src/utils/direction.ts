import type { Direction } from "../components/Modal/Modal.types";

/**
 * Worklet-safe helper. Given delta (dx, dy) decide the dominant swipe
 * direction.
 */
export const getSwipingDirection = (dx: number, dy: number): Direction => {
  "worklet";
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
};

/**
 * Worklet-safe. Returns true if `direction` is in the allowed set.
 */
export const isDirectionAllowed = (
  direction: Direction,
  allowed: Direction | Direction[] | undefined,
): boolean => {
  "worklet";
  if (!allowed) return false;
  if (Array.isArray(allowed)) return allowed.indexOf(direction) !== -1;
  return allowed === direction;
};

/**
 * Worklet-safe. Returns the signed accumulated distance for the given
 * direction. Positive when swiping further, used to compare against
 * `swipeThreshold`.
 */
export const accumulatedDistance = (
  direction: Direction,
  dx: number,
  dy: number,
): number => {
  "worklet";
  switch (direction) {
    case "up":
      return -dy;
    case "down":
      return dy;
    case "right":
      return dx;
    case "left":
      return -dx;
  }
};
