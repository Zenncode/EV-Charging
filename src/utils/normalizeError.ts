import type { ApiError } from "../types/api";

export function normalizeError(error: unknown): ApiError {
  if (typeof error === "string") {
    return { message: error };
  }

  if (typeof error === "object" && error && "message" in error) {
    return {
      message: String((error as { message?: unknown }).message ?? "Something went wrong"),
      details: error,
    };
  }

  return { message: "Something went wrong", details: error };
}
