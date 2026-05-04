/**
 * Built-in animation presets. Each preset defines a `from` and `to` frame
 * relative to the screen. The Modal interpolates between them based on a
 * 0 → 1 progress shared value.
 *
 * Names mirror `react-native-modal` / `react-native-animatable` so existing
 * `animationIn` / `animationOut` strings keep working after migration.
 */
import type { AnimationPresetName } from "../Modal.types";

export type AnimationFrame = {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
};

export type ResolvedFrames = {
  from: AnimationFrame;
  to: AnimationFrame;
};

export type Dimensions2D = {
  width: number;
  height: number;
};

type PresetFn = (dims: Dimensions2D) => ResolvedFrames;

const slideInDown: PresetFn = ({ height }) => ({
  from: { translateY: -height },
  to: { translateY: 0 },
});

const slideInUp: PresetFn = ({ height }) => ({
  from: { translateY: height },
  to: { translateY: 0 },
});

const slideInLeft: PresetFn = ({ width }) => ({
  from: { translateX: -width },
  to: { translateX: 0 },
});

const slideInRight: PresetFn = ({ width }) => ({
  from: { translateX: width },
  to: { translateX: 0 },
});

const slideOutDown: PresetFn = ({ height }) => ({
  from: { translateY: 0 },
  to: { translateY: height },
});

const slideOutUp: PresetFn = ({ height }) => ({
  from: { translateY: 0 },
  to: { translateY: -height },
});

const slideOutLeft: PresetFn = ({ width }) => ({
  from: { translateX: 0 },
  to: { translateX: -width },
});

const slideOutRight: PresetFn = ({ width }) => ({
  from: { translateX: 0 },
  to: { translateX: width },
});

const fadeIn: PresetFn = () => ({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeOut: PresetFn = () => ({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const fadeInUp: PresetFn = ({ height }) => ({
  from: { opacity: 0, translateY: height * 0.25 },
  to: { opacity: 1, translateY: 0 },
});

const fadeInDown: PresetFn = ({ height }) => ({
  from: { opacity: 0, translateY: -height * 0.25 },
  to: { opacity: 1, translateY: 0 },
});

const fadeInLeft: PresetFn = ({ width }) => ({
  from: { opacity: 0, translateX: -width * 0.25 },
  to: { opacity: 1, translateX: 0 },
});

const fadeInRight: PresetFn = ({ width }) => ({
  from: { opacity: 0, translateX: width * 0.25 },
  to: { opacity: 1, translateX: 0 },
});

const fadeOutUp: PresetFn = ({ height }) => ({
  from: { opacity: 1, translateY: 0 },
  to: { opacity: 0, translateY: -height * 0.25 },
});

const fadeOutDown: PresetFn = ({ height }) => ({
  from: { opacity: 1, translateY: 0 },
  to: { opacity: 0, translateY: height * 0.25 },
});

const fadeOutLeft: PresetFn = ({ width }) => ({
  from: { opacity: 1, translateX: 0 },
  to: { opacity: 0, translateX: -width * 0.25 },
});

const fadeOutRight: PresetFn = ({ width }) => ({
  from: { opacity: 1, translateX: 0 },
  to: { opacity: 0, translateX: width * 0.25 },
});

const zoomIn: PresetFn = () => ({
  from: { opacity: 0, scale: 0.85 },
  to: { opacity: 1, scale: 1 },
});

const zoomOut: PresetFn = () => ({
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.85 },
});

const bounceIn: PresetFn = () => ({
  from: { opacity: 0, scale: 0.3 },
  to: { opacity: 1, scale: 1 },
});

const bounceOut: PresetFn = () => ({
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.3 },
});

const flipInX: PresetFn = () => ({
  from: { opacity: 0, rotateX: 90 },
  to: { opacity: 1, rotateX: 0 },
});

const flipInY: PresetFn = () => ({
  from: { opacity: 0, rotateY: 90 },
  to: { opacity: 1, rotateY: 0 },
});

const flipOutX: PresetFn = () => ({
  from: { opacity: 1, rotateX: 0 },
  to: { opacity: 0, rotateX: 90 },
});

const flipOutY: PresetFn = () => ({
  from: { opacity: 1, rotateY: 0 },
  to: { opacity: 0, rotateY: 90 },
});

const pulse: PresetFn = () => ({
  from: { scale: 1 },
  to: { scale: 1.05 },
});

const PRESETS: Record<AnimationPresetName, PresetFn> = {
  slideInDown,
  slideInUp,
  slideInLeft,
  slideInRight,
  slideOutDown,
  slideOutUp,
  slideOutLeft,
  slideOutRight,
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeOutUp,
  fadeOutDown,
  fadeOutLeft,
  fadeOutRight,
  zoomIn,
  zoomOut,
  bounceIn,
  bounceOut,
  flipInX,
  flipInY,
  flipOutX,
  flipOutY,
  pulse,
};

export const isPresetName = (name: string): name is AnimationPresetName =>
  Object.prototype.hasOwnProperty.call(PRESETS, name);

export const resolvePreset = (
  name: AnimationPresetName,
  dims: Dimensions2D,
): ResolvedFrames => PRESETS[name](dims);

/**
 * Mirror animation derived from a swipe direction. Used by the Modal when the
 * user drags the modal off-screen — we want it to continue in the swipe
 * direction regardless of `animationOut`.
 */
export const swipeOutPresetFor = (
  direction: "up" | "down" | "left" | "right",
) => {
  switch (direction) {
    case "up":
      return "slideOutUp" as const;
    case "down":
      return "slideOutDown" as const;
    case "left":
      return "slideOutLeft" as const;
    case "right":
      return "slideOutRight" as const;
  }
};
