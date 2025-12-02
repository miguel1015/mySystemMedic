import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../option";

interface Params {
  id: string;
}

async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await res.json().catch(() => null);
  }

  return await res.text().catch(() => null);
}

/* ===========================
 * 🔹 GET /api/users/[id]
 * =========================== */
export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
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
              : data?.error ?? "Error fetching user",
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
 * 🔹 PUT /api/users/[id]
 * =========================== */
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
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
              : data?.error ?? "Error updating user",
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
 * 🔹 DELETE /api/users/[id]
 * =========================== */
export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
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
              : data?.error ?? "Error deleting user",
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "User deleted successfully",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
