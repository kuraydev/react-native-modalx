# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-04

### Added

- Initial public release. Modern, Reanimated-first replacement for
  `react-native-modal` targeting React Native 0.78+ and the New Architecture.
- **Drop-in API compatibility** with `react-native-modal`. Every public prop
  carries the same name and shape: `isVisible`, `onModalShow`/`Hide`/`Will*`,
  `animationIn`/`Out`, `animationInTiming`/`OutTiming`, `backdrop*`,
  `customBackdrop`, `swipeDirection`, `swipeThreshold`,
  `panResponderThreshold`, `propagateSwipe`, `onSwipe*`, `scroll*`,
  `coverScreen`, `deviceWidth`/`Height`, `avoidKeyboard`,
  `statusBarTranslucent`, `supportedOrientations`, `presentationStyle`,
  `hardwareAccelerated`, `onOrientationChange`, `onBackButtonPress`,
  `hideModalContentWhileAnimating`, etc.
- **27 built-in animation presets** mirroring `react-native-animatable`:
  `slideIn{Up,Down,Left,Right}`, `slideOut{Up,Down,Left,Right}`,
  `fadeIn`/`fadeOut`, `fadeIn{Up,Down,Left,Right}`,
  `fadeOut{Up,Down,Left,Right}`, `zoomIn`/`zoomOut`, `bounceIn`/`bounceOut`,
  `flipIn{X,Y}`/`flipOut{X,Y}`, `pulse`.
- **Animation builder** accepting any of: preset name, custom keyframe object
  (`{ from, to }`), or Reanimated config (`{ type: "timing" | "spring", ... }`).
- `registerAnimation()` / `unregisterAnimation()` registry mirroring
  `animatable.registerAnimation`.
- **Imperative API** via `forwardRef<ModalHandle>` plus a `useModal()` hook.
- **Global manager**: `<ModalProvider>` + `ModalManager.show()`/`hide()`/
  `hideAll()` for queue/stack-style modals.
- **Promise-based helpers** built on the manager: `ModalManager.confirm()`,
  `ModalManager.alert()`.
- **Swipe-to-dismiss** powered by `react-native-gesture-handler` v2
  (`Gesture.Pan()`), with worklet-driven direction tracking and live backdrop
  dim while dragging. Replaces the legacy `PanResponder` path.
- `position="center" | "top" | "bottom" | "fullscreen"` shortcut that picks
  sensible animation defaults.
- Respects the OS reduced-motion setting (toggleable via
  `respectReducedMotion`).
- `useNativeDriver` / `useNativeDriverForBackdrop` are accepted as no-ops with
  a one-shot dev-only `console.warn` to ease migration.
- `<Modal>` host renders through React Native's built-in `<Modal>` when
  `coverScreen` is true (default), or inline when `coverScreen={false}`.
- Full TypeScript types exported from the public surface.
- Dual CJS/ESM build via `react-native-builder-bob`, with separate
  type-definition trees for each consumer style.

### Tooling

- Jest + `@testing-library/react-native` test suite (19 tests across
  visibility, backdrop, swipe compat, imperative API, animation builder).
- ESLint + Prettier + Husky + commitlint + lint-staged + GitHub Actions CI
  (typecheck, lint, test, build).
- Expo example app under `example/` with multiple recipes (controlled
  modals, bottom sheet, spring config, imperative ref, manager queue,
  stacked modals, blur backdrop, keyboard-avoiding form, custom registered
  animation, promise-based confirm, reduced-motion toggle).

[Unreleased]: https://github.com/kuraydev/react-native-modalx/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kuraydev/react-native-modalx/releases/tag/v0.1.0
