import { createBackendProxy } from "../../../backendProxy"

// Proxy del centro de notificaciones de admisión hacia MediNexus (/api/notifications/admissions/...).
const proxy = createBackendProxy("/api/notifications/admissions", {
  forbiddenMessage: "No tienes acceso a las notificaciones de admisión.",
})

export const GET = proxy.GET
export const POST = proxy.POST
