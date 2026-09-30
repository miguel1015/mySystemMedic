import { createBackendProxy } from "../../../backendProxy"

// Proxy de Parametrización > Facturación electrónica hacia MediNexus
// (/api/electronic-invoicing/settings/...). MediNexus es quien habla con el servicio de
// Facturación Electrónica; el navegador nunca recibe sus credenciales.
const proxy = createBackendProxy("/api/electronic-invoicing/settings", {
  forbiddenMessage: "Solo el SuperAdmin puede gestionar la facturación electrónica.",
})

export const GET = proxy.GET
export const POST = proxy.POST
export const PUT = proxy.PUT
