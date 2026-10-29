import { proxyToBackend } from "../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/admissions/${encodeURIComponent(params.id)}/summary`)
}
