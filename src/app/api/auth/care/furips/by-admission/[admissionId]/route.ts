import { proxyToBackend } from "../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { admissionId: string } }) {
  return proxyToBackend(`/api/furips/by-admission/${encodeURIComponent(params.admissionId)}`)
}
