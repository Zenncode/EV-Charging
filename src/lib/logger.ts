export const logger = {
  info: (...args: unknown[]) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[info]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn("[warn]", ...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error("[error]", ...args);
  },
};
