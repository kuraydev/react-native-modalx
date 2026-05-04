import { useMemo } from "react";
import { Gesture, type GestureType } from "react-native-gesture-handler";
import {
  runOnJS,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import type {
  Direction,
  OnSwipeCompleteParams,
  SwipeGestureState,
} from "./Modal.types";
import {
  accumulatedDistance,
  getSwipingDirection,
  isDirectionAllowed,
} from "../../utils/direction";

export type UseModalGestureParams = {
  swipeDirection?: Direction | Direction[];
  swipeThreshold: number;
  panResponderThreshold: number;
  enabled: boolean;
  width: number;
  height: number;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  swipeOpacityFactor: SharedValue<number>;
  onSwipeStart?: (gestureState: SwipeGestureState) => void;
  onSwipeMove?: (
    percentageShown: number,
    gestureState: SwipeGestureState,
  ) => void;
  onSwipeComplete?: (
    params: OnSwipeCompleteParams,
    gestureState: SwipeGestureState,
  ) => void;
  onSwipeCancel?: (gestureState: SwipeGestureState) => void;
};

const buildGestureState = (
  x0: number,
  y0: number,
  moveX: number,
  moveY: number,
  vx: number,
  vy: number,
): SwipeGestureState => {
  "worklet";
  return {
    dx: moveX - x0,
    dy: moveY - y0,
    vx,
    vy,
    x0,
    y0,
    moveX,
    moveY,
  };
};

/**
 * Build a `react-native-gesture-handler` Pan gesture wired to Reanimated
 * shared values. The gesture is responsible for live-tracking the user's
 * finger and reporting completion / cancellation back to JS.
 */
export const useModalGesture = (
  params: UseModalGestureParams,
): GestureType | undefined => {
  const {
    swipeDirection,
    swipeThreshold,
    panResponderThreshold,
    enabled,
    width,
    height,
    dragX,
    dragY,
    swipeOpacityFactor,
    onSwipeStart,
    onSwipeMove,
    onSwipeComplete,
    onSwipeCancel,
  } = params;

  return useMemo(() => {
    if (!enabled || !swipeDirection) return undefined;

    const handleStart = (gs: SwipeGestureState) => onSwipeStart?.(gs);
    const handleMove = (factor: number, gs: SwipeGestureState) =>
      onSwipeMove?.(factor, gs);
    const handleComplete = (direction: Direction, gs: SwipeGestureState) =>
      onSwipeComplete?.({ swipingDirection: direction }, gs);
    const handleCancel = (gs: SwipeGestureState) => onSwipeCancel?.(gs);

    return Gesture.Pan()
      .activeOffsetX([-panResponderThreshold, panResponderThreshold])
      .activeOffsetY([-panResponderThreshold, panResponderThreshold])
      .onStart((e) => {
        const gs = buildGestureState(e.x, e.y, e.x, e.y, 0, 0);
        runOnJS(handleStart)(gs);
      })
      .onUpdate((e) => {
        const direction = getSwipingDirection(e.translationX, e.translationY);
        if (!isDirectionAllowed(direction, swipeDirection)) {
          dragX.value = 0;
          dragY.value = 0;
          swipeOpacityFactor.value = 1;
          return;
        }

        // Lock movement to the allowed axis only.
        if (direction === "up" || direction === "down") {
          dragX.value = 0;
          dragY.value = e.translationY;
          const factor = 1 - Math.min(Math.abs(e.translationY) / height, 1);
          swipeOpacityFactor.value = factor;
          const gs = buildGestureState(
            e.x - e.translationX,
            e.y - e.translationY,
            e.x,
            e.y,
            e.velocityX,
            e.velocityY,
          );
          runOnJS(handleMove)(factor, gs);
        } else {
          dragY.value = 0;
          dragX.value = e.translationX;
          const factor = 1 - Math.min(Math.abs(e.translationX) / width, 1);
          swipeOpacityFactor.value = factor;
          const gs = buildGestureState(
            e.x - e.translationX,
            e.y - e.translationY,
            e.x,
            e.y,
            e.velocityX,
            e.velocityY,
          );
          runOnJS(handleMove)(factor, gs);
        }
      })
      .onEnd((e) => {
        const direction = getSwipingDirection(e.translationX, e.translationY);
        const gs = buildGestureState(
          e.x - e.translationX,
          e.y - e.translationY,
          e.x,
          e.y,
          e.velocityX,
          e.velocityY,
        );

        if (!isDirectionAllowed(direction, swipeDirection)) {
          dragX.value = withSpring(0);
          dragY.value = withSpring(0);
          swipeOpacityFactor.value = withTiming(1);
          runOnJS(handleCancel)(gs);
          return;
        }

        const distance = accumulatedDistance(
          direction,
          e.translationX,
          e.translationY,
        );

        if (distance > swipeThreshold) {
          // Trigger close. The component listens to onSwipeComplete to
          // animate the modal off-screen.
          runOnJS(handleComplete)(direction, gs);
        } else {
          // Snap back.
          dragX.value = withSpring(0);
          dragY.value = withSpring(0);
          swipeOpacityFactor.value = withTiming(1);
          runOnJS(handleCancel)(gs);
        }
      });
  }, [
    enabled,
    swipeDirection,
    swipeThreshold,
    panResponderThreshold,
    width,
    height,
    dragX,
    dragY,
    swipeOpacityFactor,
    onSwipeStart,
    onSwipeMove,
    onSwipeComplete,
    onSwipeCancel,
  ]);
};
