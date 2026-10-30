import { proxyToBackend } from "../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/admissions/${encodeURIComponent(params.id)}/referral`)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.text()
  return proxyToBackend(`/api/admissions/${encodeURIComponent(params.id)}/referral`, {
    method: "PUT",
    body,
  })
}
