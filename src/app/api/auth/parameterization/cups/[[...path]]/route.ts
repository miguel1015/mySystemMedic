import { createBackendProxy } from "../../../backendProxy"

// Proxy de la tabla CUPS y la homologación del manual tarifario hacia MediNexus (/api/cups/...).
const proxy = createBackendProxy("/api/cups", {
  forbiddenMessage: "No tiene permisos para gestionar la homologación CUPS.",
})

export const GET = proxy.GET
export const POST = proxy.POST
export const PUT = proxy.PUT
