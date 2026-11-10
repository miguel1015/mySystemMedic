import { createBackendProxy } from "../../../backendProxy"

// Proxy de los avisos de triage hacia MediNexus (/api/notifications/triage/...).
const proxy = createBackendProxy("/api/notifications/triage", {
  forbiddenMessage: "No tienes acceso a los avisos de triage.",
})

export const GET = proxy.GET
export const POST = proxy.POST
