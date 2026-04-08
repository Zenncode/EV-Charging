import { deleteSecureValue, getSecureValue, setSecureValue } from "./secureStore";

const ACCESS_TOKEN_KEY = "access-token";
const REFRESH_TOKEN_KEY = "refresh-token";

export async function setAccessToken(token: string) {
  await setSecureValue(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  return getSecureValue(ACCESS_TOKEN_KEY);
}

export async function setRefreshToken(token: string) {
  await setSecureValue(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return getSecureValue(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await Promise.all([deleteSecureValue(ACCESS_TOKEN_KEY), deleteSecureValue(REFRESH_TOKEN_KEY)]);
}
