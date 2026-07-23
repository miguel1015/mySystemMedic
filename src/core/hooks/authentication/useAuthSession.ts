"use client";

import { getSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export function useAuthSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: () => getSession(),
  });
}
