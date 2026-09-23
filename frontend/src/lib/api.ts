// API client. Switches between mock data and the real backend.
// NEXT_PUBLIC_USE_MOCKS=false turns mocks off (requests go to the backend through /api/backend/*).

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

const BASE = "/api/backend";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  mock?: () => T | Promise<T>,
): Promise<T> {
  if (USE_MOCKS && mock) {
    await new Promise((r) => setTimeout(r, 400)); // imitate network latency
    return mock();
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, mock?: () => T | Promise<T>) => request<T>("GET", path, undefined, mock),
  post: <T>(path: string, body?: unknown, mock?: () => T | Promise<T>) =>
    request<T>("POST", path, body, mock),
  put: <T>(path: string, body?: unknown, mock?: () => T | Promise<T>) =>
    request<T>("PUT", path, body, mock),
  patch: <T>(path: string, body?: unknown, mock?: () => T | Promise<T>) =>
    request<T>("PATCH", path, body, mock),
  delete: <T>(path: string, mock?: () => T | Promise<T>) =>
    request<T>("DELETE", path, undefined, mock),
};
