import { createBackendProxy } from "../../backendProxy"

// Proxy de navegación del usuario autenticado hacia MediNexus (/api/navigation/me/...).
const proxy = createBackendProxy("/api/navigation/me", {
  forbiddenMessage: "No tienes acceso a esta información.",
})

export const GET = proxy.GET
