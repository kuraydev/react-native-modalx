import { useCallback, useRef, useState } from "react";
import type { ModalHandle } from "../components/Modal/Modal.types";

export type UseModalReturn = {
  /** Pass to `<Modal ref={...}>` to enable imperative show/hide. */
  ref: React.RefObject<ModalHandle | null>;
  /** Imperatively open the modal. */
  show: () => void;
  /** Imperatively close the modal. */
  hide: () => void;
  /** Toggle the modal. */
  toggle: () => void;
  /**
   * Controlled visibility flag. Reflects the latest known state of the modal
   * including in-flight transitions.
   */
  isVisible: boolean;
  /**
   * Convenience visibility prop you can spread directly onto `<Modal>` for a
   * controlled setup. When you only need imperative control, ignore this and
   * stick to `ref` + `show`/`hide`.
   */
  isVisibleProp: boolean;
};

/**
 * Imperative + controlled modal state in a single hook.
 *
 * @example
 *   const { ref, show, hide, isVisibleProp } = useModal();
 *   return (
 *     <>
 *       <Button onPress={show} title="Open" />
 *       <Modal ref={ref} isVisible={isVisibleProp} onModalHide={hide}>
 *         …
 *       </Modal>
 *     </>
 *   );
 */
export const useModal = (initialVisible = false): UseModalReturn => {
  const ref = useRef<ModalHandle | null>(null);
  const [isVisible, setIsVisible] = useState(initialVisible);

  const show = useCallback(() => {
    setIsVisible(true);
    ref.current?.show();
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    ref.current?.hide();
  }, []);

  const toggle = useCallback(() => {
    setIsVisible((v) => !v);
    ref.current?.toggle();
  }, []);

  return {
    ref,
    show,
    hide,
    toggle,
    isVisible,
    isVisibleProp: isVisible,
  };
};
