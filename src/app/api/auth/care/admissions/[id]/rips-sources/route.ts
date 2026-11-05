import { proxyToBackend } from "../../../_backendProxy"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { search } = new URL(req.url)
  return proxyToBackend(`/api/admissions/${encodeURIComponent(params.id)}/rips-sources${search}`)
}
