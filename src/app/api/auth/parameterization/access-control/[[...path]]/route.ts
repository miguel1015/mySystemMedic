import { createBackendProxy } from "../../../backendProxy"

// Proxy de Parametrización > Roles y permisos hacia MediNexus (/api/access-control/...).
const proxy = createBackendProxy("/api/access-control", {
  forbiddenMessage: "Solo el SuperAdmin puede gestionar roles y permisos.",
})

export const GET = proxy.GET
export const POST = proxy.POST
export const PUT = proxy.PUT
