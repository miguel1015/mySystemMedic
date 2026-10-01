import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getAccessToken } from "../../backend"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getAccessToken()
    const body = await req.json().catch(() => ({}))
    const data = await apiFetch(`${BACKEND_ENDPOINT}/${params.id}/send-email`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
