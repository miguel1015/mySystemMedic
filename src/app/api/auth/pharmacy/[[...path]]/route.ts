import { createBackendProxy } from "../../backendProxy"

// Proxy del módulo de farmacia hacia MediNexus (/api/pharmacy/...): bodegas, proveedores,
// inventario por lotes y movimientos.
const proxy = createBackendProxy("/api/pharmacy", {
  forbiddenMessage: "No tiene permiso para realizar esta operación de farmacia.",
})

export const GET = proxy.GET
export const POST = proxy.POST
export const PUT = proxy.PUT
export const DELETE = proxy.DELETE
