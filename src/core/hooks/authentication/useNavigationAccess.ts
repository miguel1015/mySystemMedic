"use client"

import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TNavigationAccess } from "@/core/interfaces/parameterization/accessControl"

async function getNavigationAccess(): Promise<TNavigationAccess> {
  const res = await fetch(ENDPOINTS.NAVIGATION.ACCESS, { method: "GET", credentials: "include" })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `GET error: ${res.statusText}`)
  }

  return data as TNavigationAccess
}

// Vistas que puede abrir el usuario autenticado. Se refresca al volver a la pestaña, así
// un cambio de permisos del SuperAdmin se aplica sin cerrar sesión.
export function useNavigationAccess() {
  return useQuery({
    queryKey: ["navigation-access"],
    queryFn: getNavigationAccess,
    staleTime: 60_000,
  })
}
