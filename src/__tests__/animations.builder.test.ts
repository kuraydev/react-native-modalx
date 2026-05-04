import { buildAnimation } from "../components/Modal/animations/builder";
import {
  registerAnimation,
  _resetRegistry,
} from "../components/Modal/animations/registry";

const dims = { width: 320, height: 640 };

describe("buildAnimation", () => {
  beforeEach(() => {
    _resetRegistry();
  });

  it("resolves a built-in slideInUp preset", () => {
    const res = buildAnimation("slideInUp", dims, "fadeIn");
    expect(res.frames.from.translateY).toBe(640);
    expect(res.frames.to.translateY).toBe(0);
  });

  it("falls back to the given preset when the name is unknown", () => {
    const res = buildAnimation("doesNotExist", dims, "fadeIn");
    expect(res.frames.from.opacity).toBe(0);
    expect(res.frames.to.opacity).toBe(1);
  });

  it("converts custom keyframe objects", () => {
    const res = buildAnimation(
      { from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1 } },
      dims,
      "fadeIn",
    );
    expect(res.frames.from.opacity).toBe(0);
    expect(res.frames.to.scale).toBe(1);
  });

  it("forwards reanimated config and uses fallback frames", () => {
    const res = buildAnimation({ type: "spring", damping: 15 }, dims, "fadeIn");
    expect(res.config).toEqual({ type: "spring", damping: 15 });
    expect(res.frames.from.opacity).toBe(0);
    expect(res.frames.to.opacity).toBe(1);
  });

  it("looks up custom registered presets by name", () => {
    registerAnimation("myFade", {
      from: { opacity: 0.2 },
      to: { opacity: 0.9 },
    });
    const res = buildAnimation("myFade", dims, "fadeIn");
    expect(res.frames.from.opacity).toBeCloseTo(0.2);
    expect(res.frames.to.opacity).toBeCloseTo(0.9);
  });
});
