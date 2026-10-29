import { proxyToBackend } from "../../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { admissionId: string } }) {
  return proxyToBackend(`/api/clinical-history/admissions/${params.admissionId}/audits`)
}
