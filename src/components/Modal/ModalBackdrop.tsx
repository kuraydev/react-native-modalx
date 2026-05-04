import React, { memo, type ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { modalStyles } from "./Modal.style";

type ModalBackdropProps = {
  hasBackdrop: boolean;
  backdropColor: string;
  backdropOpacity: number;
  /** 0 → 1 progress shared value (1 = fully shown). */
  progress: SharedValue<number>;
  /**
   * Optional multiplier applied on top of `progress` — used by the swipe
   * gesture to dim the backdrop while dragging.
   */
  swipeOpacityFactor: SharedValue<number>;
  customBackdrop?: ReactNode;
  onBackdropPress?: () => void;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

const ModalBackdropComponent: React.FC<ModalBackdropProps> = ({
  hasBackdrop,
  backdropColor,
  backdropOpacity,
  progress,
  swipeOpacityFactor,
  customBackdrop,
  onBackdropPress,
  width,
  height,
  style,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value * backdropOpacity * swipeOpacityFactor.value,
  }));

  if (!hasBackdrop) return null;

  const hasCustom =
    customBackdrop != null && React.isValidElement(customBackdrop);

  if (hasCustom) {
    // Custom backdrop owns its own touch handling.
    return (
      <Animated.View
        pointerEvents="auto"
        style={[
          modalStyles.backdrop,
          { width, height, backgroundColor: "transparent" },
          animatedStyle,
          style,
        ]}
      >
        {customBackdrop}
      </Animated.View>
    );
  }

  const visualBackdrop = (
    <Animated.View
      pointerEvents="none"
      style={[
        modalStyles.backdrop,
        { width, height, backgroundColor: backdropColor },
        animatedStyle,
        style,
      ]}
      testID="modalx-backdrop-visual"
    />
  );

  if (!onBackdropPress) {
    return visualBackdrop;
  }

  return (
    <>
      {visualBackdrop}
      <Pressable
        style={[modalStyles.backdrop, { width, height }]}
        onPress={onBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        testID="modalx-backdrop"
      />
    </>
  );
};

export const ModalBackdrop = memo(ModalBackdropComponent);
