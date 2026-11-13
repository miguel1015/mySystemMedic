import { createBackendProxy } from "../../../backendProxy"

// Proxy de Parametrización > Firmas hacia MediNexus (/api/signatures/...).
const proxy = createBackendProxy("/api/signatures", {
  forbiddenMessage: "Solo los administradores pueden gestionar la biblioteca de firmas.",
})

export const GET = proxy.GET
export const POST = proxy.POST
export const PUT = proxy.PUT
export const DELETE = proxy.DELETE
