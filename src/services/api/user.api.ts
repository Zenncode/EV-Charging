import type { UpdateUserPayload, UserProfile } from "../../types/user";
import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export function getProfile() {
  return apiClient.get<UserProfile>(endpoints.user.profile);
}

export function updateProfile(payload: UpdateUserPayload) {
  return apiClient.put<UserProfile>(endpoints.user.updateProfile, payload);
}
