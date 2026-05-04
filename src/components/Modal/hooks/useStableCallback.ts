import { useCallback, useRef } from "react";

/**
 * Returns a stable function reference that always invokes the latest version
 * of `fn`. Useful for callbacks handed off to Reanimated worklets via
 * `runOnJS`, where re-creating the bound JS function on every render would
 * defeat memoisation downstream.
 */
export const useStableCallback = <T extends (...args: never[]) => unknown>(
  fn: T | undefined,
): ((...args: Parameters<T>) => void) => {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: Parameters<T>) => {
    ref.current?.(...args);
  }, []);
};
