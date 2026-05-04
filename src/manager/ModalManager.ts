import type { ReactElement } from "react";
import type { ModalProps } from "../components/Modal/Modal.types";
import type { AlertDialogOptions, ConfirmDialogOptions } from "./dialogs.types";

export type ManagedModalEntry = {
  id: string;
  /** The full modal element (must be a `<Modal>` or compatible component). */
  element: ReactElement<ModalProps>;
};

type Subscriber = (entries: ManagedModalEntry[]) => void;

/**
 * Global, queue-aware imperative modal manager. Requires a `<ModalProvider>`
 * to be mounted somewhere in the tree.
 *
 * @example
 *   ModalManager.show(<Modal isVisible><Text>Hi</Text></Modal>);
 */
class ModalManagerSingleton {
  private entries: ManagedModalEntry[] = [];
  private subscribers = new Set<Subscriber>();
  private counter = 0;

  /**
   * Promise-based confirmation dialog. Wired up by `manager/dialogs.tsx`
   * — importing anything from `react-native-modalx` is enough to register it.
   */
  confirm!: (options: ConfirmDialogOptions) => Promise<boolean>;

  /** Promise-based alert dialog. See {@link confirm} for setup. */
  alert!: (options: AlertDialogOptions) => Promise<void>;

  show(element: ReactElement<ModalProps>): string {
    const id = `modalx_${++this.counter}_${Date.now()}`;
    this.entries = [...this.entries, { id, element }];
    this.notify();
    return id;
  }

  update(id: string, element: ReactElement<ModalProps>): void {
    this.entries = this.entries.map((e) => (e.id === id ? { id, element } : e));
    this.notify();
  }

  hide(id: string): void {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.notify();
  }

  hideAll(): void {
    if (this.entries.length === 0) return;
    this.entries = [];
    this.notify();
  }

  getEntries(): ManagedModalEntry[] {
    return this.entries;
  }

  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.entries);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    for (const sub of this.subscribers) sub(this.entries);
  }

  /** Test-only — clear all internal state. */
  _reset(): void {
    this.entries = [];
    this.subscribers.clear();
    this.counter = 0;
  }
}

export const ModalManager = new ModalManagerSingleton();
