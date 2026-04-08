import { config } from "../../constants/config";
import type { ApiError } from "../../types/api";
import { getAccessToken } from "../storage/token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${config.apiBaseUrl}${path}`;
}

function toApiError(error: unknown, status?: number): ApiError {
  if (typeof error === "string") {
    return { message: error, status };
  }

  if (typeof error === "object" && error && "message" in error) {
    return {
      message: String((error as { message?: unknown }).message ?? "Request failed"),
      status,
      details: error,
    };
  }

  return { message: "Request failed", status, details: error };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text as T;
  }
  return (await response.json()) as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    };

    if (options.auth !== false) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path), {
      method: options.method ?? "GET",
      headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
      signal: options.signal ?? controller.signal,
    });

    const payload = await parseResponse<unknown>(response);

    if (!response.ok) {
      throw toApiError(payload, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw toApiError("Request timeout", 408);
    }
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
