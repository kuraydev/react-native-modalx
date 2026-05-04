import React, { memo, type ReactNode } from "react";
import { type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import {
  GestureDetector,
  type GestureType,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { modalStyles } from "./Modal.style";
import type { ResolvedFrames } from "./animations/presets";
import type { Position } from "./Modal.types";

type ModalContentProps = ViewProps & {
  children: ReactNode;
  progress: SharedValue<number>;
  phase: SharedValue<"in" | "out">;
  enterFrames: ResolvedFrames;
  exitFrames: ResolvedFrames;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  gesture?: GestureType;
  position: Position;
  contentStyle?: StyleProp<ViewStyle>;
  showContent: boolean;
};

const positionStyleFor = (position: Position): StyleProp<ViewStyle> => {
  switch (position) {
    case "top":
      return modalStyles.contentTop;
    case "bottom":
      return modalStyles.contentBottom;
    case "fullscreen":
      return modalStyles.contentFullScreen;
    case "center":
    default:
      return modalStyles.content;
  }
};

const ModalContentComponent: React.FC<ModalContentProps> = ({
  children,
  progress,
  phase,
  enterFrames,
  exitFrames,
  dragX,
  dragY,
  gesture,
  position,
  contentStyle,
  showContent,
  ...rest
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const frames = phase.value === "in" ? enterFrames : exitFrames;
    const p = progress.value;
    const opacity = interpolate(
      p,
      [0, 1],
      [frames.from.opacity ?? 1, frames.to.opacity ?? 1],
    );
    const tx = interpolate(
      p,
      [0, 1],
      [frames.from.translateX ?? 0, frames.to.translateX ?? 0],
    );
    const ty = interpolate(
      p,
      [0, 1],
      [frames.from.translateY ?? 0, frames.to.translateY ?? 0],
    );
    const scale = interpolate(
      p,
      [0, 1],
      [frames.from.scale ?? 1, frames.to.scale ?? 1],
    );
    const rotate = interpolate(
      p,
      [0, 1],
      [frames.from.rotate ?? 0, frames.to.rotate ?? 0],
    );
    const rotateX = interpolate(
      p,
      [0, 1],
      [frames.from.rotateX ?? 0, frames.to.rotateX ?? 0],
    );
    const rotateY = interpolate(
      p,
      [0, 1],
      [frames.from.rotateY ?? 0, frames.to.rotateY ?? 0],
    );

    return {
      opacity,
      transform: [
        { translateX: tx + dragX.value },
        { translateY: ty + dragY.value },
        { scale },
        { rotate: `${rotate}deg` },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
      ],
    };
  }, [enterFrames, exitFrames]);

  const content = (
    <Animated.View
      pointerEvents="box-none"
      style={[positionStyleFor(position), contentStyle, animatedStyle]}
      {...rest}
    >
      {showContent ? children : null}
    </Animated.View>
  );

  if (gesture) {
    return <GestureDetector gesture={gesture}>{content}</GestureDetector>;
  }
  return content;
};

export const ModalContent = memo(ModalContentComponent);
