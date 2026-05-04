# react-native-modalx — example app

A minimal Expo app that exercises every feature of the library.

## Run

From the repo root:

```sh
cd example
npm install
npm run ios     # or: npm run android, npm run web
```

The example uses a local `file:..` dependency, so any change in `../src` hot-reloads instantly.

## What's inside

- Center modal (controlled with `isVisible`)
- Bottom sheet with swipe-to-dismiss
- Spring entry, fade exit (Reanimated config)
- Imperative `useModal()` hook
- Global `<ModalProvider>` + `ModalManager.show(...)`
