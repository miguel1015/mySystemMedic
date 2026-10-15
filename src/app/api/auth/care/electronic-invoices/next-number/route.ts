import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getAccessToken } from "../backend"

export async function GET() {
  try {
    const token = await getAccessToken()
    const data = await apiFetch(`${BACKEND_ENDPOINT}/next-number`, token)
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
