"use client"

import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess"
import { canAccessRoute } from "@/core/utils/routeAccess"

export const PHARMACY_ROUTES = {
  inventory: "/pharmacy/inventory",
  dispensing: "/pharmacy/dispensing",
  entries: "/pharmacy/entries",
  transfers: "/pharmacy/transfers",
  adjustments: "/pharmacy/adjustments",
  movements: "/pharmacy/movements",
  warehouses: "/pharmacy/warehouses",
  suppliers: "/pharmacy/suppliers",
} as const

// Muestra solo los accesos a operaciones que el rol puede hacer (el backend también lo
// valida). Mientras carga no muestra nada para no ofrecer botones que luego fallen.
export function usePharmacyAccess() {
  const { data } = useNavigationAccess()
  return (route: string) => (data ? canAccessRoute(route, data) : false)
}
