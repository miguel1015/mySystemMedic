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

function extractProblemDetailsMessage(
  parsed: unknown,
  fallback: string
): string {
  if (typeof parsed === "string") return parsed;
  if (!parsed || typeof parsed !== "object") return fallback;

  const err = parsed as Record<string, unknown>;
  const detailParts: string[] = [];

  if (err.errors && typeof err.errors === "object") {
    Object.entries(err.errors as Record<string, unknown>).forEach(
      ([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(", ") : String(messages);
        detailParts.push(`${field}: ${text}`);
      }
    );
  }

  if (detailParts.length > 0) return detailParts.join(" | ");
  if (typeof err.error === "string") return err.error;
  if (typeof err.title === "string") return err.title;
  if (typeof err.message === "string") return err.message;
  if (err.error) return JSON.stringify(err.error);

  return fallback;
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
    console.error(
      `[${endpoint}] ${res.status} ${res.statusText}\nrequestBody: ${JSON.stringify(body)}\nresponseBody: ${JSON.stringify(parsed)}`
    );
    throw new Error(extractProblemDetailsMessage(parsed, res.statusText));
  }

  return (parsed ?? {}) as T;
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
    console.error(
      `[${endpoint}] ${res.status} ${res.statusText}\nrequestBody: ${JSON.stringify(body)}\nresponseBody: ${JSON.stringify(parsed)}`
    );
    throw new Error(extractProblemDetailsMessage(parsed, res.statusText));
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
