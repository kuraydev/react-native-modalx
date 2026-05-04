export { Modal, default } from "./Modal";
export { ModalBackdrop } from "./ModalBackdrop";
export { ModalContent } from "./ModalContent";
export {
  registerAnimation,
  unregisterAnimation,
  hasCustomAnimation,
  getCustomAnimation,
} from "./animations/registry";
export type {
  AnimationFrame,
  ResolvedFrames,
  Dimensions2D,
} from "./animations/presets";
export { isPresetName, resolvePreset } from "./animations/presets";

export type {
  ModalProps,
  ModalHandle,
  AnimationProp,
  AnimationPresetName,
  CustomKeyframeAnimation,
  ReanimatedAnimationConfig,
  Direction,
  Position,
  Orientation,
  PresentationStyle,
  OnSwipeCompleteParams,
  GestureResponderEvent,
  OnOrientationChange,
  SwipeGestureState,
  OrNull,
} from "./Modal.types";
