import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Modal } from "../components/Modal/Modal";
import { ModalManager } from "./ModalManager";
import type { AlertDialogOptions, ConfirmDialogOptions } from "./dialogs.types";

export type { AlertDialogOptions, ConfirmDialogOptions };

const ConfirmDialog: React.FC<{
  options: ConfirmDialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ options, onConfirm, onCancel }) => {
  const {
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive,
  } = options;

  return (
    <View style={styles.dialog}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.row}>
        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={onCancel}
          accessibilityRole="button"
          testID="modalx-confirm-cancel"
        >
          <Text style={styles.secondaryText}>{cancelLabel}</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            destructive ? styles.destructive : styles.primary,
          ]}
          onPress={onConfirm}
          accessibilityRole="button"
          testID="modalx-confirm-ok"
        >
          <Text style={styles.primaryText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const AlertDialog: React.FC<{
  options: AlertDialogOptions;
  onClose: () => void;
}> = ({ options, onClose }) => {
  const { title, message, buttonLabel = "OK" } = options;
  return (
    <View style={styles.dialog}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable
        style={[styles.button, styles.primary, styles.fullWidth]}
        onPress={onClose}
        accessibilityRole="button"
        testID="modalx-alert-ok"
      >
        <Text style={styles.primaryText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
};

/**
 * Promise-based confirmation dialog. Resolves with `true` when the user
 * confirms, `false` when they cancel (or tap the backdrop / hardware back).
 *
 * Requires `<ModalProvider>` mounted at the app root.
 */
export const confirmDialog = (
  options: ConfirmDialogOptions,
): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    let id = "";
    const settle = (result: boolean) => {
      ModalManager.hide(id);
      resolve(result);
    };
    id = ModalManager.show(
      <Modal
        isVisible
        onBackdropPress={() => settle(false)}
        onBackButtonPress={() => settle(false)}
      >
        <ConfirmDialog
          options={options}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      </Modal>,
    );
  });

/**
 * Promise-based alert dialog. Resolves once the user dismisses it.
 *
 * Requires `<ModalProvider>` mounted at the app root.
 */
export const alertDialog = (options: AlertDialogOptions): Promise<void> =>
  new Promise<void>((resolve) => {
    let id = "";
    const settle = () => {
      ModalManager.hide(id);
      resolve();
    };
    id = ModalManager.show(
      <Modal isVisible onBackdropPress={settle} onBackButtonPress={settle}>
        <AlertDialog options={options} onClose={settle} />
      </Modal>,
    );
  });

// Attach to the singleton for ergonomic `ModalManager.confirm(...)` calls.
(
  ModalManager as unknown as {
    confirm: typeof confirmDialog;
    alert: typeof alertDialog;
  }
).confirm = confirmDialog;
(
  ModalManager as unknown as {
    confirm: typeof confirmDialog;
    alert: typeof alertDialog;
  }
).alert = alertDialog;

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 24,
    marginHorizontal: 32,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  message: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    flex: undefined,
    alignSelf: "stretch",
  },
  primary: {
    backgroundColor: "#7c5cff",
  },
  secondary: {
    backgroundColor: "#eee",
  },
  destructive: {
    backgroundColor: "#e64545",
  },
  primaryText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 15,
  },
});
