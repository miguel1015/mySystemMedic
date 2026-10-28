import { BACKEND_ENDPOINT, errorResponse, fileResponse, getToken } from "../../proxy"

interface Params {
  id: string
}

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const token = await getToken()
    const { searchParams } = new URL(req.url)
    return await fileResponse(`${BACKEND_ENDPOINT}/${params.id}/excel?${searchParams}`, token)
  } catch (e: any) {
    return errorResponse(e)
  }
}
