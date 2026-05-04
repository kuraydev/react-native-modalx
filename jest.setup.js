/* eslint-disable */
require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  // The mock ships without these — patch them in so our hooks compile.
  if (!Reanimated.useReducedMotion) {
    Reanimated.useReducedMotion = () => false;
  }
  if (!Reanimated.useSharedValue) {
    Reanimated.useSharedValue = (initial) => ({ value: initial });
  }
  if (!Reanimated.useAnimatedStyle) {
    Reanimated.useAnimatedStyle = (fn) => fn();
  }
  if (!Reanimated.withTiming) {
    Reanimated.withTiming = (toValue, _config, cb) => {
      if (cb) cb(true);
      return toValue;
    };
  }
  if (!Reanimated.withSpring) {
    Reanimated.withSpring = (toValue, _config, cb) => {
      if (cb) cb(true);
      return toValue;
    };
  }
  if (!Reanimated.runOnJS) {
    Reanimated.runOnJS = (fn) => fn;
  }
  if (!Reanimated.interpolate) {
    Reanimated.interpolate = (value, input, output) => {
      if (value <= input[0]) return output[0];
      if (value >= input[input.length - 1]) return output[output.length - 1];
      return output[0];
    };
  }
  return Reanimated;
});
