import { proxyToBackend } from "../_backendProxy"

export async function GET() {
  return proxyToBackend("/api/especialidades")
}
