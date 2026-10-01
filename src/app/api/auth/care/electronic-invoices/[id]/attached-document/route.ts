import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getAccessToken } from "../../backend"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const token = await getAccessToken()
    const data = await apiFetch(`${BACKEND_ENDPOINT}/${params.id}/attached-document`, token)
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
