import React from "react";
import { Text } from "react-native";
import { act, render } from "@testing-library/react-native";

import { Modal } from "../components/Modal/Modal";

describe("Modal — visibility transitions", () => {
  it("does not render children when initially hidden", () => {
    const { queryByText } = render(
      <Modal isVisible={false}>
        <Text>hello</Text>
      </Modal>,
    );
    expect(queryByText("hello")).toBeNull();
  });

  it("renders children when isVisible becomes true", () => {
    const { queryByText, rerender } = render(
      <Modal isVisible={false}>
        <Text>hello</Text>
      </Modal>,
    );
    expect(queryByText("hello")).toBeNull();

    rerender(
      <Modal isVisible>
        <Text>hello</Text>
      </Modal>,
    );
    expect(queryByText("hello")).not.toBeNull();
  });

  it("fires onModalWillShow / onModalShow on open", async () => {
    const onModalWillShow = jest.fn();
    const onModalShow = jest.fn();

    const { rerender } = render(
      <Modal
        isVisible={false}
        onModalWillShow={onModalWillShow}
        onModalShow={onModalShow}
      >
        <Text>hello</Text>
      </Modal>,
    );

    await act(async () => {
      rerender(
        <Modal
          isVisible
          onModalWillShow={onModalWillShow}
          onModalShow={onModalShow}
        >
          <Text>hello</Text>
        </Modal>,
      );
    });

    expect(onModalWillShow).toHaveBeenCalledTimes(1);
    // onModalShow fires after the animation completes; with the reanimated
    // mock the completion is synchronous so the JS callback should fire too.
    expect(onModalShow).toHaveBeenCalled();
  });

  it("fires onModalWillHide / onModalHide on close", async () => {
    const onModalWillHide = jest.fn();
    const onModalHide = jest.fn();

    const { rerender } = render(
      <Modal
        isVisible
        onModalWillHide={onModalWillHide}
        onModalHide={onModalHide}
      >
        <Text>hello</Text>
      </Modal>,
    );

    await act(async () => {
      rerender(
        <Modal
          isVisible={false}
          onModalWillHide={onModalWillHide}
          onModalHide={onModalHide}
        >
          <Text>hello</Text>
        </Modal>,
      );
    });

    expect(onModalWillHide).toHaveBeenCalledTimes(1);
    expect(onModalHide).toHaveBeenCalled();
  });
});
