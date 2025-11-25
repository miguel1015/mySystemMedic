import { getSession } from "next-auth/react";

export async function getAccessToken() {
  const session = await getSession();
  return session?.user?.accessToken ?? null;
}
