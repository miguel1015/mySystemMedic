import { proxyToBackend } from "../../_backendProxy"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  return proxyToBackend(`/api/furips/search?${searchParams}`)
}
