const seen = new Set<string>();

/**
 * Emit a `console.warn` once per process per key. Used for one-shot
 * deprecation notices.
 */
export const warnOnce = (key: string, message: string): void => {
  if (__DEV__ && !seen.has(key)) {
    seen.add(key);
    // eslint-disable-next-line no-console
    console.warn(message);
  }
};

/** Test-only — clear the seen set between tests. */
export const _resetWarnOnce = (): void => {
  seen.clear();
};
