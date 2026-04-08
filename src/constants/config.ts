const DEFAULT_TIMEOUT_MS = 15000;

function toNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? "development",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api",
  requestTimeoutMs: toNumber(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
};
