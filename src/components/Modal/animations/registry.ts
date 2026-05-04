/**
 * Public registry for user-defined animations. Mirrors the
 * `animatable.registerAnimation` API from `react-native-animatable` so a
 * migration from `react-native-modal` keeps working.
 */
import type { CustomKeyframeAnimation } from "../Modal.types";
import type { ResolvedFrames, Dimensions2D, AnimationFrame } from "./presets";

const customRegistry = new Map<string, CustomKeyframeAnimation>();

export const registerAnimation = (
  name: string,
  animation: CustomKeyframeAnimation,
): void => {
  customRegistry.set(name, animation);
};

export const unregisterAnimation = (name: string): void => {
  customRegistry.delete(name);
};

export const hasCustomAnimation = (name: string): boolean =>
  customRegistry.has(name);

export const getCustomAnimation = (
  name: string,
): CustomKeyframeAnimation | undefined => customRegistry.get(name);

const TRANSFORM_KEYS: Array<keyof AnimationFrame> = [
  "translateX",
  "translateY",
  "scale",
  "rotate",
  "rotateX",
  "rotateY",
];

const NUMERIC_KEYS: Array<keyof AnimationFrame> = [
  "opacity",
  ...TRANSFORM_KEYS,
];

const toFrame = (
  obj: Record<string, number | string> | undefined,
  fallback: AnimationFrame,
): AnimationFrame => {
  if (!obj) return fallback;
  const out: AnimationFrame = {};
  for (const key of NUMERIC_KEYS) {
    const v = obj[key];
    if (typeof v === "number") {
      out[key] = v;
    } else if (typeof v === "string") {
      const parsed = parseFloat(v);
      if (!Number.isNaN(parsed)) out[key] = parsed;
    }
  }
  return { ...fallback, ...out };
};

/**
 * Convert a custom keyframe animation into the uniform `{ from, to }` shape
 * the Modal's animated style understands.
 */
export const resolveCustomKeyframeAnimation = (
  animation: CustomKeyframeAnimation,
  fallback: ResolvedFrames,
  _dims: Dimensions2D,
): ResolvedFrames => ({
  from: toFrame(animation.from, fallback.from),
  to: toFrame(animation.to, fallback.to),
});

/** Test-only — clear the registry between tests. */
export const _resetRegistry = () => {
  customRegistry.clear();
};
