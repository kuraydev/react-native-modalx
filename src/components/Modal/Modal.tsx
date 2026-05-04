import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  View,
} from "react-native";
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

import { ModalBackdrop } from "./ModalBackdrop";
import { ModalContent } from "./ModalContent";
import { useModalGesture } from "./ModalGesture";
import { modalStyles } from "./Modal.style";
import { buildAnimation } from "./animations/builder";
import { swipeOutPresetFor } from "./animations/presets";
import { useBackHandler } from "./hooks/useBackHandler";
import { useDeviceDimensions } from "./hooks/useDeviceDimensions";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useStableCallback } from "./hooks/useStableCallback";
import {
  type AnimationProp,
  type Direction,
  type ModalHandle,
  type ModalProps,
  type Position,
} from "./Modal.types";
import { warnOnce } from "../../utils/warnOnce";

type Status = "closed" | "opening" | "open" | "closing";

const positionDefaults: Record<
  Position,
  { animationIn: AnimationProp; animationOut: AnimationProp }
> = {
  center: { animationIn: "fadeIn", animationOut: "fadeOut" },
  top: { animationIn: "slideInDown", animationOut: "slideOutUp" },
  bottom: { animationIn: "slideInUp", animationOut: "slideOutDown" },
  fullscreen: { animationIn: "fadeIn", animationOut: "fadeOut" },
};

const DEFAULTS = {
  animationInTiming: 300,
  animationOutTiming: 300,
  backdropTransitionInTiming: 300,
  backdropTransitionOutTiming: 300,
  backdropOpacity: 0.7,
  backdropColor: "black",
  hasBackdrop: true,
  coverScreen: true,
  panResponderThreshold: 4,
  swipeThreshold: 100,
  position: "center" as Position,
};

export const Modal = forwardRef<ModalHandle, ModalProps>(
  function Modal(props, ref) {
    const {
      children,
      isVisible: isVisibleProp,
      onModalShow,
      onModalWillShow,
      onModalHide,
      onModalWillHide,
      onShow,
      onDismiss,
      animationIn: animationInProp,
      animationOut: animationOutProp,
      animationInTiming = DEFAULTS.animationInTiming,
      animationOutTiming = DEFAULTS.animationOutTiming,
      hasBackdrop = DEFAULTS.hasBackdrop,
      backdropColor = DEFAULTS.backdropColor,
      backdropOpacity = DEFAULTS.backdropOpacity,
      backdropTransitionInTiming = DEFAULTS.backdropTransitionInTiming,
      backdropTransitionOutTiming = DEFAULTS.backdropTransitionOutTiming,
      customBackdrop,
      onBackdropPress,
      swipeDirection,
      swipeThreshold = DEFAULTS.swipeThreshold,
      panResponderThreshold = DEFAULTS.panResponderThreshold,
      onSwipeStart,
      onSwipeMove,
      onSwipeComplete,
      onSwipeCancel,
      coverScreen = DEFAULTS.coverScreen,
      deviceWidth,
      deviceHeight,
      avoidKeyboard,
      statusBarTranslucent,
      supportedOrientations,
      presentationStyle,
      hardwareAccelerated,
      onOrientationChange,
      onBackButtonPress,
      hideModalContentWhileAnimating,
      position = DEFAULTS.position,
      respectReducedMotion = true,
      modalTestID,
      style,
      useNativeDriver,
      useNativeDriverForBackdrop,
      ...viewProps
    } = props;

    if (useNativeDriver !== undefined) {
      warnOnce(
        "modalkit:useNativeDriver",
        "[react-native-modalkit] `useNativeDriver` is a no-op — animations run on the " +
          "UI thread via Reanimated. You can safely remove this prop.",
      );
    }
    if (useNativeDriverForBackdrop !== undefined) {
      warnOnce(
        "modalkit:useNativeDriverForBackdrop",
        "[react-native-modalkit] `useNativeDriverForBackdrop` is a no-op — backdrop " +
          "animations run on the UI thread via Reanimated. You can safely remove this prop.",
      );
    }

    /* --------------------------- dimensions / motion --------------------------- */
    const { width, height } = useDeviceDimensions(deviceWidth, deviceHeight);
    const reduceMotion = useReducedMotion(respectReducedMotion);

    /* --------------------------- resolved animations --------------------------- */
    const positionDefault = positionDefaults[position];
    const enterAnim = useMemo(
      () =>
        buildAnimation(
          animationInProp ?? positionDefault.animationIn,
          { width, height },
          typeof positionDefault.animationIn === "string"
            ? positionDefault.animationIn
            : "fadeIn",
        ),
      [animationInProp, positionDefault.animationIn, width, height],
    );
    const exitAnim = useMemo(
      () =>
        buildAnimation(
          animationOutProp ?? positionDefault.animationOut,
          { width, height },
          typeof positionDefault.animationOut === "string"
            ? positionDefault.animationOut
            : "fadeOut",
        ),
      [animationOutProp, positionDefault.animationOut, width, height],
    );

    /* ------------------------------ state machine ------------------------------ */
    const [status, setStatus] = useState<Status>(
      isVisibleProp ? "opening" : "closed",
    );

    const progress = useSharedValue(0);
    const phase = useSharedValue<"in" | "out">("in");
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const swipeOpacityFactor = useSharedValue(1);
    const backdropProgress = useSharedValue(0);

    // Override frames used by exit animation when closing was triggered by a
    // swipe — we want the modal to continue in the swipe direction.
    const [swipeDirectionForClose, setSwipeDirectionForClose] =
      useState<Direction | null>(null);
    const swipeExitAnim = useMemo(() => {
      if (!swipeDirectionForClose) return null;
      return buildAnimation(
        swipeOutPresetFor(swipeDirectionForClose),
        { width, height },
        "fadeOut",
      );
    }, [swipeDirectionForClose, width, height]);

    const effectiveExitAnim = swipeExitAnim ?? exitAnim;

    /* ------------------------------- callbacks --------------------------------- */
    const handleOnModalShow = useStableCallback(onModalShow);
    const handleOnModalWillShow = useStableCallback(onModalWillShow);
    const handleOnModalHide = useStableCallback(onModalHide);
    const handleOnModalWillHide = useStableCallback(onModalWillHide);
    const handleOnShow = useStableCallback(onShow);
    const handleOnDismiss = useStableCallback(onDismiss);

    const onOpenComplete = useCallback(() => {
      setStatus("open");
      handleOnModalShow();
    }, [handleOnModalShow]);

    // onCloseComplete only marks the React-side animation as done. The user
    // facing `onModalHide` callback is intentionally fired LATER, from
    // `handleNativeDismiss` below — once iOS has actually torn down the
    // native modal window. That's the only timing at which it's safe for
    // a consumer to dispatch the next modal in a chain.
    const onCloseComplete = useCallback(() => {
      setStatus("closed");
      setSwipeDirectionForClose(null);
    }, []);

    /* ---------------------------- animation runners ---------------------------- */
    const runOpen = useCallback(() => {
      handleOnModalWillShow();
      // Mid-close → open: carry over `1 - progress` so the visual position
      // is preserved instead of snapping. For matching enter/exit pairs
      // this produces a perfectly smooth reversal.
      const carryOver =
        phase.value === "out"
          ? Math.max(0, Math.min(1, 1 - progress.value))
          : 0;
      phase.value = "in";
      progress.value = carryOver;
      dragX.value = 0;
      dragY.value = 0;
      swipeOpacityFactor.value = 1;

      if (reduceMotion) {
        progress.value = 1;
        backdropProgress.value = 1;
        onOpenComplete();
        return;
      }

      const { config } = enterAnim;
      if (config?.type === "spring") {
        const { type: _t, preset: _p, ...spring } = config;
        progress.value = withSpring(
          1,
          spring as WithSpringConfig,
          (finished) => {
            if (finished) runOnJS(onOpenComplete)();
          },
        );
      } else if (config?.type === "timing") {
        const { type: _t, preset: _p, ...timing } = config;
        progress.value = withTiming(
          1,
          timing as WithTimingConfig,
          (finished) => {
            if (finished) runOnJS(onOpenComplete)();
          },
        );
      } else {
        progress.value = withTiming(
          1,
          { duration: animationInTiming },
          (finished) => {
            if (finished) runOnJS(onOpenComplete)();
          },
        );
      }

      backdropProgress.value = withTiming(1, {
        duration: backdropTransitionInTiming,
      });
    }, [
      handleOnModalWillShow,
      phase,
      progress,
      dragX,
      dragY,
      swipeOpacityFactor,
      backdropProgress,
      reduceMotion,
      enterAnim,
      animationInTiming,
      backdropTransitionInTiming,
      onOpenComplete,
    ]);

    const runClose = useCallback(() => {
      handleOnModalWillHide();
      // Mirror of `runOpen` — preserve visual position on mid-flight reversal.
      const carryOver =
        phase.value === "in" ? Math.max(0, Math.min(1, 1 - progress.value)) : 0;
      phase.value = "out";
      progress.value = carryOver;
      swipeOpacityFactor.value = 1;

      if (reduceMotion) {
        progress.value = 1;
        backdropProgress.value = 0;
        onCloseComplete();
        return;
      }

      const { config } = exitAnim;
      if (config?.type === "spring") {
        const { type: _t, preset: _p, ...spring } = config;
        progress.value = withSpring(
          1,
          spring as WithSpringConfig,
          (finished) => {
            if (finished) runOnJS(onCloseComplete)();
          },
        );
      } else if (config?.type === "timing") {
        const { type: _t, preset: _p, ...timing } = config;
        progress.value = withTiming(
          1,
          timing as WithTimingConfig,
          (finished) => {
            if (finished) runOnJS(onCloseComplete)();
          },
        );
      } else {
        progress.value = withTiming(
          1,
          { duration: animationOutTiming },
          (finished) => {
            if (finished) runOnJS(onCloseComplete)();
          },
        );
      }

      backdropProgress.value = withTiming(0, {
        duration: backdropTransitionOutTiming,
      });
    }, [
      handleOnModalWillHide,
      phase,
      progress,
      swipeOpacityFactor,
      backdropProgress,
      reduceMotion,
      exitAnim,
      animationOutTiming,
      backdropTransitionOutTiming,
      onCloseComplete,
    ]);

    /* --------------------------- visibility transitions --------------------------- */
    // When `isVisibleProp` is `undefined` the consumer is using the imperative
    // API (`useModal` / ref / `ModalManager`) — we don't sync visibility from
    // props in that case.
    useEffect(() => {
      if (isVisibleProp === undefined) return;

      if (isVisibleProp && status === "closed") {
        setStatus("opening");
      } else if (
        !isVisibleProp &&
        (status === "open" || status === "opening")
      ) {
        setStatus("closing");
      } else if (isVisibleProp && status === "closing") {
        // user re-opened mid close
        setStatus("opening");
      }
    }, [isVisibleProp, status]);

    useEffect(() => {
      if (status === "opening") runOpen();
      else if (status === "closing") runClose();
    }, [status, runOpen, runClose]);

    /* -------------------------------- imperative -------------------------------- */
    useImperativeHandle(
      ref,
      () => ({
        show: () => {
          if (status === "closed") setStatus("opening");
        },
        hide: () => {
          if (status === "open" || status === "opening") setStatus("closing");
        },
        toggle: () => {
          if (status === "closed") setStatus("opening");
          else if (status === "open" || status === "opening")
            setStatus("closing");
        },
        get isVisible() {
          return status === "open" || status === "opening";
        },
      }),
      [status],
    );

    /* --------------------------------- back press -------------------------------- */
    const onBackPress = useCallback((): boolean => {
      if (onBackButtonPress && (status === "open" || status === "opening")) {
        onBackButtonPress();
        return true;
      }
      return false;
    }, [onBackButtonPress, status]);

    useBackHandler(status !== "closed", onBackPress);

    /* ---------------------------------- swipe ---------------------------------- */
    const handleSwipeComplete = useCallback(
      (
        params: { swipingDirection: Direction },
        gs: Parameters<NonNullable<ModalProps["onSwipeComplete"]>>[1],
      ) => {
        onSwipeComplete?.(params, gs);
        // Default behaviour: dismiss the modal in the swipe direction.
        setSwipeDirectionForClose(params.swipingDirection);
        setStatus("closing");
      },
      [onSwipeComplete],
    );

    const gesture = useModalGesture({
      swipeDirection,
      swipeThreshold,
      panResponderThreshold,
      enabled: status !== "closed",
      width,
      height,
      dragX,
      dragY,
      swipeOpacityFactor,
      onSwipeStart,
      onSwipeMove,
      onSwipeComplete: handleSwipeComplete,
      onSwipeCancel,
    });

    // Mount the native <RNModal> only while the modal is in use. Idle
    // mounted modals leave subscribed GestureDetectors and lingering iOS
    // UIWindows that can swallow taps on the underlying screen.
    const [shouldMountHost, setShouldMountHost] = useState(!!isVisibleProp);

    useEffect(() => {
      if (status !== "closed") setShouldMountHost(true);
    }, [status]);

    // Single source of truth for "the modal is now fully gone, including the
    // native window". Fires the user-facing `onModalHide` and `onDismiss`
    // callbacks, then unmounts the host. Triggered by RN's onDismiss on iOS
    // (after UIKit finishes its dismiss animation) or by a timeout fallback
    // on Android (RN's onDismiss is iOS-only).
    const fullyDismissedRef = useRef(false);
    const finalizeDismissal = useCallback(() => {
      if (fullyDismissedRef.current) return;
      fullyDismissedRef.current = true;
      handleOnDismiss();
      handleOnModalHide();
      setShouldMountHost(false);
    }, [handleOnDismiss, handleOnModalHide]);

    // Reset the latch whenever we re-open so a subsequent close can fire.
    useEffect(() => {
      if (status === "opening") fullyDismissedRef.current = false;
    }, [status]);

    // Android (and iOS edge cases) fallback — onDismiss isn't guaranteed.
    const teardownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
      if (teardownTimerRef.current) {
        clearTimeout(teardownTimerRef.current);
        teardownTimerRef.current = null;
      }
      if (status === "closed" && shouldMountHost) {
        teardownTimerRef.current = setTimeout(finalizeDismissal, 250);
      }
      return () => {
        if (teardownTimerRef.current) {
          clearTimeout(teardownTimerRef.current);
          teardownTimerRef.current = null;
        }
      };
    }, [status, shouldMountHost, finalizeDismissal]);

    const hostVisible = status !== "closed";

    const renderedContent = (
      <ModalContent
        progress={progress}
        phase={phase}
        enterFrames={enterAnim.frames}
        exitFrames={effectiveExitAnim.frames}
        dragX={dragX}
        dragY={dragY}
        gesture={gesture}
        position={position}
        contentStyle={style}
        showContent={!hideModalContentWhileAnimating || status === "open"}
        {...viewProps}
      >
        {children}
      </ModalContent>
    );

    const inner = (
      <>
        <ModalBackdrop
          hasBackdrop={hasBackdrop}
          backdropColor={backdropColor}
          backdropOpacity={backdropOpacity}
          progress={backdropProgress}
          swipeOpacityFactor={swipeOpacityFactor}
          customBackdrop={customBackdrop}
          onBackdropPress={onBackdropPress}
          width={width}
          height={height}
        />
        {avoidKeyboard ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            pointerEvents="box-none"
            style={modalStyles.contentFullScreen}
          >
            {renderedContent}
          </KeyboardAvoidingView>
        ) : (
          renderedContent
        )}
      </>
    );

    if (!coverScreen) {
      if (!hostVisible) return null;
      return (
        <View
          pointerEvents="box-none"
          style={[modalStyles.backdrop, modalStyles.containerBox]}
          testID={modalTestID}
        >
          {inner}
        </View>
      );
    }

    if (!shouldMountHost) return null;

    return (
      <RNModal
        transparent
        animationType="none"
        visible={hostVisible}
        onRequestClose={onBackPress}
        onShow={handleOnShow}
        onDismiss={finalizeDismissal}
        supportedOrientations={supportedOrientations}
        presentationStyle={presentationStyle}
        hardwareAccelerated={hardwareAccelerated}
        statusBarTranslucent={statusBarTranslucent}
        onOrientationChange={onOrientationChange}
        testID={modalTestID}
      >
        {inner}
      </RNModal>
    );
  },
);

export default Modal;
