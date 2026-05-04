import React, { useEffect, useState, type ReactNode } from "react";

import { ModalManager, type ManagedModalEntry } from "../manager/ModalManager";

type ModalProviderProps = {
  children: ReactNode;
};

/**
 * Hosts modals dispatched via {@link ModalManager}. Mount this once near the
 * top of your app to enable imperative `ModalManager.show(...)` calls.
 */
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<ManagedModalEntry[]>(() =>
    ModalManager.getEntries(),
  );

  useEffect(() => ModalManager.subscribe(setEntries), []);

  return (
    <>
      {children}
      {entries.map((entry) =>
        // Inject `isVisible` (flipped by ModalManager.hide) and an
        // `onModalHide` that finalises removal once the close animation
        // has actually played. The user's own `onModalHide` is preserved.
        React.cloneElement(entry.element, {
          key: entry.id,
          isVisible: entry.isVisible,
          onModalHide: () => {
            entry.element.props.onModalHide?.();
            ModalManager._remove(entry.id);
          },
        }),
      )}
    </>
  );
};
