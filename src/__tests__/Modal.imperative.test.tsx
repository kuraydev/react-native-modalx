import React from "react";
import { Button, Text } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";

import { Modal } from "../components/Modal/Modal";
import { useModal } from "../hooks/useModal";
import { ModalProvider } from "../context/ModalProvider";
import { ModalManager } from "../manager/ModalManager";

const Harness: React.FC = () => {
  const modal = useModal();
  return (
    <>
      <Button title="open" onPress={modal.show} testID="open-btn" />
      <Modal ref={modal.ref}>
        <Text>imperative-content</Text>
      </Modal>
    </>
  );
};

describe("Modal — imperative API", () => {
  it("opens via ref.show()", async () => {
    const { getByTestId, queryByText } = render(<Harness />);
    expect(queryByText("imperative-content")).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId("open-btn"));
    });

    expect(queryByText("imperative-content")).not.toBeNull();
  });
});

describe("ModalManager + ModalProvider", () => {
  beforeEach(() => {
    ModalManager._reset();
  });

  it("renders modals dispatched via ModalManager.show()", async () => {
    const { queryByText } = render(
      <ModalProvider>
        <Text>app</Text>
      </ModalProvider>,
    );

    expect(queryByText("from-manager")).toBeNull();

    await act(async () => {
      ModalManager.show(
        <Modal isVisible>
          <Text>from-manager</Text>
        </Modal>,
      );
    });

    expect(queryByText("from-manager")).not.toBeNull();
  });

  it("removes the modal when hideAll() is called", async () => {
    const { queryByText } = render(
      <ModalProvider>
        <Text>app</Text>
      </ModalProvider>,
    );

    let id = "";
    await act(async () => {
      id = ModalManager.show(
        <Modal isVisible>
          <Text>queued</Text>
        </Modal>,
      );
    });
    expect(queryByText("queued")).not.toBeNull();
    expect(id).toMatch(/^modalkit_/);

    await act(async () => {
      ModalManager.hideAll();
    });
    expect(queryByText("queued")).toBeNull();
  });
});
