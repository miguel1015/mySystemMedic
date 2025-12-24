import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await res.json().catch(() => null);
  }

  return await res.text().catch(() => null);
}

/* ===========================
 * 🔹 GET /api/navigation/me
 * =========================== */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/navigation/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    const data = await parseApiResponse(res);

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            typeof data === "string"
              ? data
              : data?.error ?? "Error fetching navigation",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ===========================
 * 🔹 PUT /api/navigation/me
 * =========================== */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/navigation/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await parseApiResponse(res);

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            typeof data === "string"
              ? data
              : data?.error ?? "Error updating navigation",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ===========================
 * 🔹 DELETE /api/navigation/me
 * =========================== */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/navigation/me`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    const data = await parseApiResponse(res);

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            typeof data === "string"
              ? data
              : data?.error ?? "Error deleting navigation",
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Navigation deleted successfully",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
