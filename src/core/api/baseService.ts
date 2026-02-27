export interface RequestOptions {
  token?: string;
  params?: Record<string, string | number | boolean>;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>
) {
  const url = new URL(endpoint, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

function buildHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* -------------------------------- GET -------------------------------- */

export async function getAll<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(options?.token),
  });

  if (!res.ok) {
    throw new Error(`GET error: ${res.statusText}`);
  }

  return (await res.json()) as T;
}

/* -------------------------------- POST -------------------------------- */

export async function create<T, U>(
  endpoint: string,
  body: U,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(options?.token),
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";

  const parsed = contentType.includes("application/json")
    ? ((await res.json().catch(() => null)) as T | { error?: string } | null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const errorMessage =
      typeof parsed === "string"
        ? parsed
        : parsed && typeof parsed === "object" && "error" in parsed
        ? parsed.error ?? res.statusText
        : res.statusText;

    throw new Error(errorMessage);
  }

  if (
    !contentType.includes("application/json") ||
    parsed == null ||
    typeof parsed === "string"
  ) {
    throw new Error("Invalid response format: expected JSON object");
  }

  return parsed as T;
}

/* -------------------------------- PUT -------------------------------- */

export async function updatePut<T, U>(
  endpoint: string,
  body: U,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: buildHeaders(options?.token),
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";

  const parsed = contentType.includes("application/json")
    ? ((await res.json().catch(() => null)) as T | { error?: string } | null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      typeof parsed === "string"
        ? parsed
        : parsed && typeof parsed === "object" && "error" in parsed
        ? parsed.error ?? res.statusText
        : res.statusText;

    throw new Error(message);
  }

  if (
    !contentType.includes("application/json") ||
    parsed == null ||
    typeof parsed === "string"
  ) {
    return {} as T;
  }

  return parsed as T;
}

/* -------------------------------- PATCH -------------------------------- */

export async function updatePatch<T, U>(
  endpoint: string,
  body: U,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: buildHeaders(options?.token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`PATCH error: ${res.statusText}`);
  }

  return (await res.json()) as T;
}

/* -------------------------------- DELETE -------------------------------- */

export async function remove<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(options?.token),
  });

  if (!res.ok) {
    throw new Error(`DELETE error: ${res.statusText}`);
  }

  return (await res.json()) as T;
}

/* -------------------------------- GET ONE -------------------------------- */

export async function getById<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(options?.token),
  });

  if (!res.ok) {
    throw new Error(`GET ONE error: ${res.statusText}`);
  }

  return (await res.json()) as T;
}
