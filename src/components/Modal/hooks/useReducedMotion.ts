import { useReducedMotion as reanimatedUseReducedMotion } from "react-native-reanimated";

/**
 * Wraps Reanimated's `useReducedMotion`. When the user has explicitly opted
 * in or out via `respectReducedMotion`, that value wins.
 */
export const useReducedMotion = (respect: boolean | undefined): boolean => {
  const systemPreference = reanimatedUseReducedMotion();
  if (respect === false) return false;
  return systemPreference;
};
