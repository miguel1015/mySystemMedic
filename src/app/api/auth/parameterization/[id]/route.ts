import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

const TYPE_CONFIG = {
  insurers: {
    endpoint: "/api/insurers",
  },
  tariffs: {
    endpoint: "/api/tariff-schedules",
  },
  brokers: {
    endpoint: "/api/brokers",
  },
  users: {
    endpoint: "/api/users",
  },
  contracts: {
    endpoint: "/api/contracts",
  },
  "contract-details": {
    endpoint: "/api/contract-details",
  },
} as const;

type ParameterType = keyof typeof TYPE_CONFIG;

interface Params {
  id: string;
}

/* ===========================
 * 🔹 HELPERS INTERNOS
 * =========================== */
function resolveEndpoint(type: ParameterType, id?: string) {
  const base = TYPE_CONFIG[type].endpoint;
  return id ? `${base}/${id}` : base;
}

async function getAuthAndType(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    throw { status: 401, message: "Unauthorized" };
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "insurers") as ParameterType;

  if (!TYPE_CONFIG[type]) {
    throw {
      status: 400,
      message: "Invalid type parameter",
      validTypes: Object.keys(TYPE_CONFIG),
    };
  }

  return {
    token: session.user.accessToken,
    type,
  };
}

async function apiFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: typeof data === "string" ? data : data?.error,
    };
  }

  return data;
}

/* ===========================
 * 🔹 GET /api/parameterization/[id]
 * =========================== */
export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { token, type } = await getAuthAndType(req);
    const data = await apiFetch(resolveEndpoint(type, params?.id), token);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error", validTypes: e.validTypes },
      { status: e.status ?? 500 },
    );
  }
}

/* ===========================
 * 🔹 PUT /api/parameterization/[id]
 * =========================== */
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const { token, type } = await getAuthAndType(req);
    const body = await req.json();

    const data = await apiFetch(resolveEndpoint(type, params.id), token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: e.status ?? 500 },
    );
  }
}

/* ===========================
 * 🔹 DELETE /api/parameterization/[id]
 * =========================== */
export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const { token, type } = await getAuthAndType(req);

    await apiFetch(resolveEndpoint(type, params.id), token, {
      method: "DELETE",
    });

    return NextResponse.json({
      ok: true,
      message: "Deleted successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: e.status ?? 500 },
    );
  }
}
