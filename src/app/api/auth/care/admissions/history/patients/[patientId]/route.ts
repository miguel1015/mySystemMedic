import { proxyToBackend } from "../../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { patientId: string } }) {
  return proxyToBackend(`/api/admissions/history/patients/${encodeURIComponent(params.patientId)}`)
}
