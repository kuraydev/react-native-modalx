import { useEffect, useState } from "react";
import { Dimensions, type ScaledSize } from "react-native";

export type DeviceDimensions = {
  width: number;
  height: number;
};

/**
 * Tracks the device window dimensions and re-renders when they change
 * (orientation, split-screen, foldables, etc.). Optional overrides allow the
 * caller to pin a specific size.
 */
export const useDeviceDimensions = (
  overrideWidth?: number | null,
  overrideHeight?: number | null,
): DeviceDimensions => {
  const [size, setSize] = useState<DeviceDimensions>(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  useEffect(() => {
    const handler = ({ window }: { window: ScaledSize }) => {
      setSize({ width: window.width, height: window.height });
    };
    const sub = Dimensions.addEventListener("change", handler);
    return () => sub.remove();
  }, []);

  return {
    width: overrideWidth ?? size.width,
    height: overrideHeight ?? size.height,
  };
};
