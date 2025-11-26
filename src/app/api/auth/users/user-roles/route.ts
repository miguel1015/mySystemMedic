import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-roles`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error fetching user roles" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
