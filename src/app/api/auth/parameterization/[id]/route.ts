import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

interface Params {
  id: string;
}

const TYPE_TO_ENDPOINT: Record<string, string> = {
  insurers: "/api/insurers/",
};

async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await res.json().catch(() => null);
  }

  return await res.text().catch(() => null);
}

/* ===========================
 * 🔹 GET /api/parameterization/[id]
 * =========================== */
export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "insurers";

    if (!TYPE_TO_ENDPOINT[type]) {
      return NextResponse.json(
        {
          error: "Invalid type parameter",
          received: type,
          validTypes: Object.keys(TYPE_TO_ENDPOINT),
        },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${TYPE_TO_ENDPOINT[type]}${params.id}`,
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
 * 🔹 PUT /api/parameterization/[id]
 * =========================== */
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "insurers";

    if (!TYPE_TO_ENDPOINT[type]) {
      return NextResponse.json(
        {
          error: "Invalid type parameter",
          received: type,
          validTypes: Object.keys(TYPE_TO_ENDPOINT),
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${TYPE_TO_ENDPOINT[type]}${params.id}`,
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
 * 🔹 DELETE /api/parameterization/[id]
 * =========================== */
export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "insurers";

    if (!TYPE_TO_ENDPOINT[type]) {
      return NextResponse.json(
        {
          error: "Invalid type parameter",
          received: type,
          validTypes: Object.keys(TYPE_TO_ENDPOINT),
        },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${TYPE_TO_ENDPOINT[type]}${params.id}`,
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
