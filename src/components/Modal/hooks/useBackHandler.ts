import { useEffect } from "react";
import { BackHandler } from "react-native";

/**
 * Registers a hardware back-press listener while `enabled` is true. Returning
 * `true` from `handler` consumes the event.
 */
export const useBackHandler = (
  enabled: boolean,
  handler: () => boolean,
): void => {
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", handler);
    return () => sub.remove();
  }, [enabled, handler]);
};
