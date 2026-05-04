import type { ReactElement } from "react";
import type { ModalProps } from "../components/Modal/Modal.types";
import type { AlertDialogOptions, ConfirmDialogOptions } from "./dialogs.types";

export type ManagedModalEntry = {
  id: string;
  /** The full modal element (must be a `<Modal>` or compatible component). */
  element: ReactElement<ModalProps>;
  /**
   * Whether the entry should be visible. Flipped to `false` by
   * {@link ModalManager.hide} so the Modal can play its close animation;
   * the entry is removed from the queue only after `onModalHide` fires.
   */
  isVisible: boolean;
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
    this.entries = [...this.entries, { id, element, isVisible: true }];
    this.notify();
    return id;
  }

  update(id: string, element: ReactElement<ModalProps>): void {
    this.entries = this.entries.map((e) =>
      e.id === id ? { ...e, element } : e,
    );
    this.notify();
  }

  /**
   * Trigger a graceful close. The Modal's `isVisible` flips false, the
   * close animation plays, and the entry is removed from the queue once
   * `onModalHide` fires (wired up by `<ModalProvider>`).
   */
  hide(id: string): void {
    this.entries = this.entries.map((e) =>
      e.id === id ? { ...e, isVisible: false } : e,
    );
    this.notify();
  }

  hideAll(): void {
    if (this.entries.length === 0) return;
    this.entries = this.entries.map((e) => ({ ...e, isVisible: false }));
    this.notify();
  }

  /**
   * Internal — called by `<ModalProvider>` after `onModalHide` fires to
   * actually remove the entry from the tree. End-users should call
   * {@link hide} instead.
   */
  _remove(id: string): void {
    this.entries = this.entries.filter((e) => e.id !== id);
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

  /** Test-only — synchronously remove every entry. */
  _resetEntries(): void {
    if (this.entries.length === 0) return;
    this.entries = [];
    this.notify();
  }
}

export const ModalManager = new ModalManagerSingleton();
