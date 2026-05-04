import type { ReactNode } from "react";
import type {
  StyleProp,
  ViewProps,
  ViewStyle,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

/* ---------------------------- Public utility types ---------------------------- */

export type OrNull<T> = T | null;

export type Direction = "up" | "down" | "left" | "right";

export type Orientation =
  | "portrait"
  | "portrait-upside-down"
  | "landscape"
  | "landscape-left"
  | "landscape-right";

export type PresentationStyle =
  | "fullScreen"
  | "pageSheet"
  | "formSheet"
  | "overFullScreen";

export type Position = "center" | "top" | "bottom" | "fullscreen";

export interface GestureResponderEvent extends NativeSyntheticEvent<NativeTouchEvent> {}

export type OnOrientationChange = (
  orientation: NativeSyntheticEvent<unknown>,
) => void;

export type OnSwipeCompleteParams = {
  swipingDirection: Direction;
};

/* ----------------------------- Animation primitives ---------------------------- */

/**
 * The set of preset names mirrored from `react-native-modal` /
 * `react-native-animatable`. Users migrating can keep their existing strings.
 */
export type AnimationPresetName =
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "slideOutUp"
  | "slideOutDown"
  | "slideOutLeft"
  | "slideOutRight"
  | "fadeIn"
  | "fadeOut"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "fadeOutUp"
  | "fadeOutDown"
  | "fadeOutLeft"
  | "fadeOutRight"
  | "zoomIn"
  | "zoomOut"
  | "bounceIn"
  | "bounceOut"
  | "flipInX"
  | "flipInY"
  | "flipOutX"
  | "flipOutY"
  | "pulse";

/**
 * The animation keyframe shape from `react-native-animatable` is supported
 * for backwards compatibility.
 *
 * @example
 *   { from: { opacity: 0 }, to: { opacity: 1 } }
 */
export type CustomKeyframeAnimation = {
  from?: Record<string, number | string>;
  to?: Record<string, number | string>;
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
};

/**
 * A modern, Reanimated-native animation config. Pick `timing` for
 * duration-based animations or `spring` for physics-based ones.
 *
 * Pair with a `preset` to drive that preset's frames (translate, scale,
 * etc.) with the chosen physics. Without `preset`, the config drives the
 * position-default preset's frames — for `position="center"` that's a
 * `fadeIn`/`fadeOut`, where a spring's overshoot is invisible. If you
 * want the bouncy effect, set `preset: "zoomIn"` (or similar).
 */
export type ReanimatedAnimationConfig =
  | ({ type: "timing"; preset?: AnimationPresetName } & WithTimingConfig)
  | ({ type: "spring"; preset?: AnimationPresetName } & WithSpringConfig);

/**
 * A union of every accepted form for `animationIn` / `animationOut`.
 */
export type AnimationProp =
  | AnimationPresetName
  | string
  | CustomKeyframeAnimation
  | ReanimatedAnimationConfig;

/* --------------------------------- Modal props -------------------------------- */

export type ModalProps = ViewProps & {
  children: ReactNode;

  /* ----- visibility (controlled) ----- */
  isVisible?: boolean;

  /* ----- lifecycle ----- */
  onModalShow?: () => void;
  onModalWillShow?: () => void;
  onModalHide?: () => void;
  onModalWillHide?: () => void;
  onShow?: () => void;
  onDismiss?: () => void;

  /* ----- animations ----- */
  animationIn?: AnimationProp;
  animationOut?: AnimationProp;
  animationInTiming?: number;
  animationOutTiming?: number;

  /* ----- backdrop ----- */
  hasBackdrop?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  backdropTransitionInTiming?: number;
  backdropTransitionOutTiming?: number;
  customBackdrop?: ReactNode;
  onBackdropPress?: () => void;

  /* ----- swipe ----- */
  swipeDirection?: Direction | Direction[];
  swipeThreshold?: number;
  panResponderThreshold?: number;
  /**
   * Allow nested scrollables to scroll while the modal swipe gesture is also
   * recognised. Pass `true` or a function for fine-grained control.
   */
  propagateSwipe?:
    | boolean
    | ((
        event: GestureResponderEvent,
        gestureState: SwipeGestureState,
      ) => boolean);
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

  /* ----- scroll integration (RN-modal compat) ----- */
  scrollTo?: OrNull<
    (args: { x?: number; y?: number; animated?: boolean }) => void
  >;
  scrollOffset?: number;
  scrollOffsetMax?: number;
  scrollHorizontal?: boolean;

  /* ----- layout / device ----- */
  coverScreen?: boolean;
  deviceWidth?: OrNull<number>;
  deviceHeight?: OrNull<number>;
  avoidKeyboard?: boolean;
  statusBarTranslucent?: boolean;
  supportedOrientations?: Orientation[];
  presentationStyle?: PresentationStyle;
  hardwareAccelerated?: boolean;
  onOrientationChange?: OnOrientationChange;
  style?: StyleProp<ViewStyle>;

  /* ----- back button (Android) ----- */
  onBackButtonPress?: () => void;

  /* ----- misc ----- */
  hideModalContentWhileAnimating?: boolean;

  /* ----- modalx extras ----- */
  /**
   * Convenience shortcut for common modal placements. When set, sensible
   * defaults are applied for `animationIn` / `animationOut` / `style`.
   */
  position?: Position;
  /**
   * Use the OS reduced-motion preference to skip animations. Defaults to
   * `true`. Set to `false` to force animations.
   */
  respectReducedMotion?: boolean;
  /**
   * Forwarded to the underlying React Native `<Modal>` host when
   * `coverScreen` is true.
   */
  modalTestID?: string;

  /* ----- legacy / accepted but unused ----- */
  /**
   * @deprecated Reanimated already drives animations on the UI thread; this
   *   prop is accepted for migration compatibility but has no effect.
   */
  useNativeDriver?: boolean;
  /**
   * @deprecated See {@link useNativeDriver}.
   */
  useNativeDriverForBackdrop?: boolean;
};

/**
 * Snapshot of an in-flight swipe gesture, intentionally shaped like
 * `PanResponderGestureState` so existing handlers keep working.
 */
export type SwipeGestureState = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  x0: number;
  y0: number;
  moveX: number;
  moveY: number;
};

/**
 * Imperative handle exposed via `ref` on `<Modal>`. Mirrors the shape returned
 * by {@link useModal}.
 */
export type ModalHandle = {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  readonly isVisible: boolean;
};
