# CLAUDE.md

Project guidance for AI coding assistants working in this repo.

## What this is

`react-native-modalx` — a Reanimated-first, drop-in replacement for
[`react-native-modal`](https://github.com/react-native-modal/react-native-modal).

Goals:

- API-compatible with `react-native-modal`. Migrators should change one
  import line and have everything keep working.
- Targets React Native **0.78+** and the **New Architecture** (Fabric).
- All animations driven by `react-native-reanimated` (>=3.10).
- Swipes driven by `react-native-gesture-handler` v2 (>=2.16).
- Imperative API (`useModal`, `<ModalProvider>`, `ModalManager`) for
  queue/stack-style modals.

## Authoring rules

**Do NOT add AI attribution anywhere.** This includes:

- No `Co-Authored-By:` trailers on commits.
- No "🤖 Generated with Claude Code" or similar in PR bodies, READMEs,
  CHANGELOG entries, code comments, or any other file.
- No comments referencing "AI", "Claude", "Cursor", or the conversation.
- If a file has been scaffolded from another tool that injects such
  attribution, strip it before committing.

**Conventions:**

- TypeScript-first. Use `type` aliases over `interface` unless extending.
- Double quotes (enforced by ESLint).
- Default to **no comments**. Only add a comment when the _why_ is
  non-obvious (a hidden constraint, a workaround). Never narrate what the
  code is doing.
- Don't introduce new dependencies without checking they're justified.
- Public types live in `src/components/Modal/Modal.types.ts`. Add to that
  file rather than scattering definitions.

## Project layout

```
src/
  index.ts                              — public surface
  components/Modal/
    Modal.tsx                           — main component (forwardRef)
    Modal.types.ts                      — every public type
    Modal.style.ts
    ModalBackdrop.tsx
    ModalContent.tsx
    ModalGesture.tsx                    — Gesture.Pan() worklet
    animations/
      presets.ts                        — built-in animation frames
      builder.ts                        — string|keyframe|reanimated-config → frames
      registry.ts                       — registerAnimation()
    hooks/                              — useDeviceDimensions, useBackHandler, useReducedMotion, useStableCallback
  hooks/useModal.ts                     — public imperative hook
  context/ModalProvider.tsx             — host for ModalManager
  manager/
    ModalManager.ts                     — singleton dispatch
    dialogs.tsx                         — confirmDialog / alertDialog promise helpers
  utils/                                — direction, warnOnce
example/                                — Expo example app, file:.. dependency
```

## Commands

```sh
npm run typecheck     # tsc --noEmit
npm run lint          # eslint src/**/*.{ts,tsx}
npm test              # jest
npm run build         # bob build (CJS + ESM + types)
```

CI runs typecheck → lint → test → build on every push and PR.

## Compatibility contract

When adding a feature, check the [`react-native-modal` README](https://github.com/react-native-modal/react-native-modal#available-props)
first. If the feature exists there, **mirror its name and shape exactly**
so migrators don't have to relearn anything. Only invent new prop names
when the feature is genuinely new (e.g. `position`, `respectReducedMotion`,
`modalTestID`).

Legacy props that don't translate to a Reanimated world (`useNativeDriver`,
`useNativeDriverForBackdrop`) are accepted as no-ops with a one-shot
`console.warn` via `src/utils/warnOnce.ts`. Don't remove this — it's part
of the migration story.

## Tests

Tests live in `src/__tests__/`. Use `@testing-library/react-native`. The
Reanimated mock is patched in `jest.setup.js` to add the worklet primitives
that ship without (`useReducedMotion`, `withTiming`, etc.) — extend that
file when adding APIs that need test stubs.

## Publishing

This is a public npm package. Before bumping the version:

1. Update `CHANGELOG.md` with the new entry.
2. Run `npm run typecheck && npm run lint && npm test && npm run build`.
3. Run `npm pack --dry-run` and inspect the file list — make sure tests,
   the example app, and `node_modules` are excluded.
4. `npm version <patch|minor|major>`.
5. `npm publish` (or `npm publish --tag beta` for prereleases).
