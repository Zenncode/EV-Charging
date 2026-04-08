export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log("[analytics]", name, params ?? {});
  }
}
