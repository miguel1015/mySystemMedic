import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../option"

interface Params {
  doc: string
}

export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/patients/by-document/${encodeURIComponent(params.doc)}`,
      {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      },
    )

    const contentType = res.headers.get("content-type") ?? ""
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null)

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.title || data?.message || data?.error || res.statusText
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
