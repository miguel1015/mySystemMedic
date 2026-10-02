import { proxyToBackend as proxy } from "../_backendProxy"

export const proxyToBackend = (path: string, init: RequestInit = {}) =>
  proxy(`/api/ordenes-medicas${path}`, init)
