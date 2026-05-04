import type {
  AnimationProp,
  ReanimatedAnimationConfig,
  CustomKeyframeAnimation,
} from "../Modal.types";
import {
  isPresetName,
  resolvePreset,
  type ResolvedFrames,
  type Dimensions2D,
} from "./presets";
import {
  getCustomAnimation,
  hasCustomAnimation,
  resolveCustomKeyframeAnimation,
} from "./registry";

const DEFAULT_FRAMES: ResolvedFrames = {
  from: { opacity: 1 },
  to: { opacity: 1 },
};

const isCustomKeyframe = (value: unknown): value is CustomKeyframeAnimation =>
  typeof value === "object" &&
  value !== null &&
  ("from" in value || "to" in value) &&
  !("type" in value);

const isReanimatedConfig = (
  value: unknown,
): value is ReanimatedAnimationConfig =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  ((value as { type: string }).type === "timing" ||
    (value as { type: string }).type === "spring");

export type ResolvedAnimation = {
  frames: ResolvedFrames;
  config?: ReanimatedAnimationConfig;
};

/**
 * Resolve any accepted animation prop into a uniform shape the Modal can
 * hand off to Reanimated.
 *
 * - String preset name → looked up in built-in presets, then custom registry
 * - Custom keyframe object → converted via the registry helper
 * - Reanimated config object → frames default to a fade so progress still
 *   drives _something_, but the timing/spring config is forwarded
 */
export const buildAnimation = (
  animation: AnimationProp | undefined,
  dims: Dimensions2D,
  fallbackPresetName: string,
): ResolvedAnimation => {
  if (animation == null) {
    return resolveByName(fallbackPresetName, dims);
  }

  if (typeof animation === "string") {
    const resolved = resolveByName(animation, dims);
    if (resolved.frames === DEFAULT_FRAMES) {
      // Unknown name — fall back to the caller-provided default so the modal
      // still has a sensible animation.
      return resolveByName(fallbackPresetName, dims);
    }
    return resolved;
  }

  if (isReanimatedConfig(animation)) {
    return {
      frames: resolveByName(fallbackPresetName, dims).frames,
      config: animation,
    };
  }

  if (isCustomKeyframe(animation)) {
    const fallback = resolveByName(fallbackPresetName, dims).frames;
    return {
      frames: resolveCustomKeyframeAnimation(animation, fallback, dims),
    };
  }

  return resolveByName(fallbackPresetName, dims);
};

const resolveByName = (name: string, dims: Dimensions2D): ResolvedAnimation => {
  if (isPresetName(name)) {
    return { frames: resolvePreset(name, dims) };
  }
  if (hasCustomAnimation(name)) {
    const custom = getCustomAnimation(name);
    if (custom) {
      return {
        frames: resolveCustomKeyframeAnimation(custom, DEFAULT_FRAMES, dims),
      };
    }
  }
  // Unknown name — return identity frames so the modal still appears.
  return { frames: DEFAULT_FRAMES };
};
