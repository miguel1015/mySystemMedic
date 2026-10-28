import { proxyToBackend } from "../_backendProxy"

export async function POST(req: Request) {
  const body = await req.text()
  return proxyToBackend("/api/furips", { method: "POST", body })
}
