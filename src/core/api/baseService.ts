export async function getAll<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  try {
    const url = new URL(endpoint, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error fetching: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("getAll error:", error);
    throw error;
  }
}
