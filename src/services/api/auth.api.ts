import { endpoints } from "./endpoints";
import { apiClient } from "./client";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  AuthUser,
} from "../../types/auth";
import { clearTokens, setAccessToken, setRefreshToken } from "../storage/token";

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>(endpoints.auth.login, payload, { auth: false });
  await setAccessToken(response.tokens.accessToken);
  if (response.tokens.refreshToken) {
    await setRefreshToken(response.tokens.refreshToken);
  }
  return response;
}

export async function register(payload: RegisterPayload) {
  return apiClient.post<RegisterResponse>(endpoints.auth.register, payload, { auth: false });
}

export async function getCurrentUser() {
  return apiClient.get<AuthUser>(endpoints.auth.me);
}

export async function logout() {
  await apiClient.post<{ success: boolean }>(endpoints.auth.logout);
  await clearTokens();
}
