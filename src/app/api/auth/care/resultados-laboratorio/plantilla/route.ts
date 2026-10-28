import { BACKEND_ENDPOINT, errorResponse, fileResponse, getToken } from "../proxy"

export async function GET(req: Request) {
  try {
    const token = await getToken()
    const { searchParams } = new URL(req.url)
    return await fileResponse(`${BACKEND_ENDPOINT}/plantilla?${searchParams}`, token)
  } catch (e: any) {
    return errorResponse(e)
  }
}
