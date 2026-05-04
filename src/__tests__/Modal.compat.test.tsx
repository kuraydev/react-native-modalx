import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { Modal } from "../components/Modal/Modal";
import { _resetWarnOnce } from "../utils/warnOnce";

describe("Modal — react-native-modal compatibility", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    _resetWarnOnce();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns once when useNativeDriver is passed", () => {
    render(
      <Modal isVisible useNativeDriver>
        <Text>hello</Text>
      </Modal>,
    );
    render(
      <Modal isVisible useNativeDriver>
        <Text>hello again</Text>
      </Modal>,
    );

    const matching = warnSpy.mock.calls.filter((args) =>
      String(args[0]).includes("useNativeDriver"),
    );
    expect(matching.length).toBe(1);
  });

  it("warns once when useNativeDriverForBackdrop is passed", () => {
    render(
      <Modal isVisible useNativeDriverForBackdrop>
        <Text>hello</Text>
      </Modal>,
    );

    const matching = warnSpy.mock.calls.filter((args) =>
      String(args[0]).includes("useNativeDriverForBackdrop"),
    );
    expect(matching.length).toBe(1);
  });

  it("accepts string animationIn / animationOut presets", () => {
    expect(() =>
      render(
        <Modal isVisible animationIn="slideInUp" animationOut="slideOutDown">
          <Text>hello</Text>
        </Modal>,
      ),
    ).not.toThrow();
  });

  it("accepts CustomKeyframeAnimation objects", () => {
    expect(() =>
      render(
        <Modal
          isVisible
          animationIn={{ from: { opacity: 0 }, to: { opacity: 1 } }}
        >
          <Text>hello</Text>
        </Modal>,
      ),
    ).not.toThrow();
  });
});
