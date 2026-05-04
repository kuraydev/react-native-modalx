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
      {entries.map(({ id, element }) =>
        React.cloneElement(element, { key: id }),
      )}
    </>
  );
};
