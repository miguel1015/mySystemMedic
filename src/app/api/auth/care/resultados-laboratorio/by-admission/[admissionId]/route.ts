import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getToken } from "../../proxy"

interface Params {
  admissionId: string
}

export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const token = await getToken()
    const data = await apiFetch(`${BACKEND_ENDPOINT}/by-admission/${params.admissionId}`, token)
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
