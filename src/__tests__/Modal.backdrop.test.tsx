import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { Modal } from "../components/Modal/Modal";

describe("Modal — backdrop", () => {
  it("invokes onBackdropPress when backdrop is tapped", () => {
    const onBackdropPress = jest.fn();
    const { getByTestId } = render(
      <Modal isVisible onBackdropPress={onBackdropPress}>
        <Text>hello</Text>
      </Modal>,
    );

    fireEvent.press(getByTestId("modalkit-backdrop"));
    expect(onBackdropPress).toHaveBeenCalledTimes(1);
  });

  it("renders without backdrop when hasBackdrop is false", () => {
    const { queryByTestId } = render(
      <Modal isVisible hasBackdrop={false}>
        <Text>hello</Text>
      </Modal>,
    );
    expect(queryByTestId("modalkit-backdrop")).toBeNull();
    expect(queryByTestId("modalkit-backdrop-visual")).toBeNull();
  });

  it("renders a custom backdrop when provided", () => {
    const { getByTestId } = render(
      <Modal isVisible customBackdrop={<Text testID="my-backdrop">x</Text>}>
        <Text>hello</Text>
      </Modal>,
    );
    expect(getByTestId("my-backdrop")).toBeTruthy();
  });
});
