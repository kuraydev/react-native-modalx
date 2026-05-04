# react-native-modalx

> Modern, [Reanimated](https://docs.swmansion.com/react-native-reanimated/)-first **drop-in replacement** for [`react-native-modal`](https://github.com/react-native-modal/react-native-modal). Same props you know, all running on the UI thread, plus an imperative API, queue-aware `<ModalProvider>`, and gesture v2 swipes.

[![npm](https://img.shields.io/npm/v/react-native-modalx?style=flat-square)](https://www.npmjs.com/package/react-native-modalx)
[![license](https://img.shields.io/npm/l/react-native-modalx?style=flat-square)](./LICENSE)

## Why?

`react-native-modal` is wonderful, but it ships in 2026 still on top of `react-native-animatable` and `Animated` + `PanResponder`. **modalx** keeps the API but rewires the internals:

- ⚡ Animations driven by **Reanimated 3** worklets — no JS-thread jank
- 👆 Swipes powered by **`react-native-gesture-handler` v2** — plays nicely with nested scrollables
- 🪄 **Drop-in API** — change one import line, your existing props keep working
- 🧰 New: imperative `useModal()` hook, global `<ModalProvider>` + `ModalManager` for queue / stack-style modals
- 🦴 New: `position="bottom" | "top" | "center" | "fullscreen"` shortcut
- ♿️ New: respects the OS reduced-motion setting out of the box
- 🆕 Built for **React Native 0.78+** and the **New Architecture** (Fabric)

## Install

```sh
npm install react-native-modalx react-native-reanimated react-native-gesture-handler
# or
yarn add react-native-modalx react-native-reanimated react-native-gesture-handler
```

Then follow the standard setup steps for the two peers:

- [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [Gesture Handler installation guide](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)

> Wrap your app in `<GestureHandlerRootView>` (most templates already do this).

### Peer dep matrix

| Peer                           | Required version |
| ------------------------------ | ---------------- |
| `react`                        | `>=18.3`         |
| `react-native`                 | `>=0.78`         |
| `react-native-reanimated`      | `>=3.10`         |
| `react-native-gesture-handler` | `>=2.16`         |

## Quick start

```tsx
import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import Modal from "react-native-modalx";

export const MyDialog = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      <Button title="Open" onPress={() => setIsVisible(true)} />
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        onSwipeComplete={() => setIsVisible(false)}
        swipeDirection="down"
        position="bottom"
      >
        <View
          style={{ padding: 24, backgroundColor: "white", borderRadius: 12 }}
        >
          <Text>Hello modalx 👋</Text>
        </View>
      </Modal>
    </View>
  );
};
```

## Migrating from `react-native-modal`

For most projects, this is the entire diff:

```diff
- import Modal from "react-native-modal";
+ import Modal from "react-native-modalx";
```

Every public prop carries the same name and same shape. Your `animationIn="slideInUp"`, your `swipeDirection={["up", "down"]}`, your `customBackdrop`, your `onModalHide` — all keep working.

A few props that no longer make sense are accepted with a one-time dev warning:

| Prop                         | Status                                                 |
| ---------------------------- | ------------------------------------------------------ |
| `useNativeDriver`            | accepted, no-op (Reanimated already runs on UI thread) |
| `useNativeDriverForBackdrop` | accepted, no-op                                        |

If you used `react-native-animatable`'s `registerAnimation`, modalx ships an equivalent:

```ts
import { registerAnimation } from "react-native-modalx";

registerAnimation("myFancySlide", {
  from: { opacity: 0, translateY: 200 },
  to: { opacity: 1, translateY: 0 },
});
```

## Imperative API

For modals you don't want to wire to your render state:

```tsx
import { useModal, Modal } from "react-native-modalx";

const Screen = () => {
  const modal = useModal();

  return (
    <>
      <Button title="Open" onPress={modal.show} />
      <Modal ref={modal.ref} swipeDirection="down" onSwipeComplete={modal.hide}>
        <Sheet onClose={modal.hide} />
      </Modal>
    </>
  );
};
```

`useModal()` returns:

- `ref` — pass to `<Modal ref={...} />`
- `show()`, `hide()`, `toggle()` — imperative controls
- `isVisible` — current visibility (synchronous read)
- `isVisibleProp` — convenience: pass to a controlled `<Modal isVisible={...} />`

## Queueing modals globally

For things like global confirms / alerts, mount a `<ModalProvider>` at the app root and dispatch via `ModalManager`:

```tsx
// App.tsx
import { ModalProvider } from "react-native-modalx";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalProvider>
        <AppNavigator />
      </ModalProvider>
    </GestureHandlerRootView>
  );
}
```

```tsx
// anywhere
import { ModalManager, Modal } from "react-native-modalx";

const id = ModalManager.show(
  <Modal
    isVisible
    position="bottom"
    onBackdropPress={() => ModalManager.hide(id)}
  >
    <ConfirmDialog />
  </Modal>,
);
```

## Animation configs

`animationIn` / `animationOut` accept any of:

```tsx
// 1. Built-in preset name (same names as react-native-modal)
<Modal animationIn="slideInUp" animationOut="slideOutDown" />

// 2. Custom keyframe object (react-native-animatable shape)
<Modal animationIn={{ from: { opacity: 0, scale: 0.7 }, to: { opacity: 1, scale: 1 } }} />

// 3. Reanimated config — full control, springs supported.
//    Pair with `preset` so the physics drives a visible transform.
<Modal animationIn={{ type: "spring", preset: "zoomIn", damping: 11, stiffness: 110 }} />
<Modal animationIn={{ type: "timing", preset: "slideInUp", duration: 250 }} />

// Without `preset`, the config drives the position default's frames
// (fadeIn for `position="center"`), which makes a spring's overshoot
// invisible — set `preset` if you want the boing.
```

### Built-in presets

`slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideOutUp`, `slideOutDown`, `slideOutLeft`, `slideOutRight`, `fadeIn`, `fadeOut`, `fadeInUp/Down/Left/Right`, `fadeOutUp/Down/Left/Right`, `zoomIn`, `zoomOut`, `bounceIn`, `bounceOut`, `flipInX/Y`, `flipOutX/Y`, `pulse`.

### Position shortcuts

```tsx
<Modal position="bottom">…</Modal>   // slideInUp / slideOutDown defaults
<Modal position="top">…</Modal>      // slideInDown / slideOutUp
<Modal position="center">…</Modal>   // fadeIn / fadeOut (default)
<Modal position="fullscreen">…</Modal>
```

Explicit `animationIn` / `animationOut` always override the position default.

## Props reference

All `react-native-modal` props are supported. modalx-specific additions:

| Prop                   | Type                                            | Default    | Notes                                                    |
| ---------------------- | ----------------------------------------------- | ---------- | -------------------------------------------------------- |
| `position`             | `"center" \| "top" \| "bottom" \| "fullscreen"` | `"center"` | Layout + animation defaults shortcut                     |
| `respectReducedMotion` | `boolean`                                       | `true`     | Skip animations when the OS reduced-motion setting is on |
| `modalTestID`          | `string`                                        | —          | Forwarded to the underlying `<Modal>` host               |

See [`Modal.types.ts`](./src/components/Modal/Modal.types.ts) for the full surface.

## Example app

A minimal Expo app lives in [`example/`](./example):

```sh
cd example
npm install
npm run start
```

## Contributing

PRs welcome. The library is built with [`react-native-builder-bob`](https://github.com/callstack/react-native-builder-bob) and tested with Jest + RNTL.

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## License

MIT © [FreakyCoder](https://github.com/kuraydev)
