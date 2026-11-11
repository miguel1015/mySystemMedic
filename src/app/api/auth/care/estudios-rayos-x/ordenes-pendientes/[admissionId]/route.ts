import { proxyToBackend } from "../../../_backendProxy"

// Órdenes de rayos X de la admisión pendientes de realizar.
export async function GET(_req: Request, { params }: { params: { admissionId: string } }) {
  return proxyToBackend(
    `/api/estudios-rayos-x/ordenes-pendientes/${encodeURIComponent(params.admissionId)}`,
  )
}
