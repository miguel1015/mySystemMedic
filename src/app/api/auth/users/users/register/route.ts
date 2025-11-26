import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../option";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error creating user profile" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
