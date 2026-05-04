/**
 * react-native-modalkit
 *
 * Modern, Reanimated-first replacement for `react-native-modal`. Drop-in API
 * compatible — switch the import line and you're done. Bonus: imperative
 * `useModal()` hook, `<ModalProvider>` + `ModalManager` for queueing,
 * `react-native-gesture-handler` v2 swipes, and reduced-motion awareness.
 *
 * @example
 *   import Modal from "react-native-modalkit";
 *
 *   export const MyDialog = ({ isVisible, onClose }) => (
 *     <Modal
 *       isVisible={isVisible}
 *       onBackdropPress={onClose}
 *       swipeDirection="down"
 *       onSwipeComplete={onClose}
 *       position="bottom"
 *     >
 *       <View>{ ... }</View>
 *     </Modal>
 *   );
 */

import { Modal } from "./components/Modal/Modal";

// Default export = the Modal component, matching `react-native-modal`.
export default Modal;

// Backwards-compat alias for migrators using `import { ReactNativeModal } from 'react-native-modal'`.
export { Modal, Modal as ReactNativeModal } from "./components/Modal/Modal";

// Imperative API
export { useModal } from "./hooks/useModal";
export type { UseModalReturn } from "./hooks/useModal";

// Provider + manager for queue-style usage
export { ModalProvider } from "./context/ModalProvider";
export { ModalManager } from "./manager/ModalManager";
export type { ManagedModalEntry } from "./manager/ModalManager";

// Promise-based confirm/alert helpers (also attached as ModalManager.confirm/alert)
export { confirmDialog, alertDialog } from "./manager/dialogs";
export type {
  ConfirmDialogOptions,
  AlertDialogOptions,
} from "./manager/dialogs";

// Animation registry — extension point mirroring animatable.registerAnimation
export {
  registerAnimation,
  unregisterAnimation,
  hasCustomAnimation,
} from "./components/Modal/animations/registry";

// Public types
export type {
  ModalProps,
  ModalHandle,
  AnimationProp,
  AnimationPresetName,
  CustomKeyframeAnimation,
  ReanimatedAnimationConfig,
  Direction,
  Position,
  Orientation,
  PresentationStyle,
  OnSwipeCompleteParams,
  GestureResponderEvent,
  OnOrientationChange,
  SwipeGestureState,
  OrNull,
} from "./components/Modal/Modal.types";
