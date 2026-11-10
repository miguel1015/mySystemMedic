// Canal mínimo para que cualquier cliente HTTP avise de un 401 sin depender de React.
// SessionKeeper escucha el evento y decide si la sesión murió de verdad.

export const UNAUTHORIZED_EVENT = "dm:unauthorized";

export function reportUnauthorized() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

// Endpoints propios de NextAuth: un 401 ahí no significa token vencido.
const NEXTAUTH_PATHS = /^\/api\/auth\/(session|csrf|signin|signout|callback|providers|error|_log)(\/|$)/;

/** true si la URL es una ruta API de esta app cuyo 401 indica sesión inválida. */
export function isAppApiUrl(input: RequestInfo | URL): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.origin);
    return (
      url.origin === window.location.origin &&
      url.pathname.startsWith("/api/") &&
      !NEXTAUTH_PATHS.test(url.pathname)
    );
  } catch {
    return false;
  }
}
