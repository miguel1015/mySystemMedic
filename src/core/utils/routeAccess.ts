import { TNavigationAccess } from "@/core/interfaces/parameterization/accessControl"

// "care/triage", "/Care/Triage/" -> "/care/triage"
export function normalizeRoute(route: string) {
  const trimmed = route.trim().replace(/\/+$/, "").toLowerCase()
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

const isUnder = (path: string, route: string) => path === route || path.startsWith(`${route}/`)

// Decide si el usuario puede abrir `pathname`:
//  * Se busca la ruta registrada (vista del menú) más específica que contenga el path;
//    así "/care/triage/12/edit" se rige por la vista "/care/triage".
//  * Si ninguna vista registrada la contiene, la ruta no está restringida (inicio, hojas
//    clínicas que se abren desde otra vista, etc.).
export function canAccessRoute(pathname: string, access: TNavigationAccess) {
  if (access.hasFullAccess) return true

  const path = normalizeRoute(pathname)
  const governingRoute = access.protectedRoutes
    .map(normalizeRoute)
    .filter((route) => route !== "/" && isUnder(path, route))
    .sort((a, b) => b.length - a.length)[0]

  if (!governingRoute) return true

  return access.allowedRoutes.some((route) => normalizeRoute(route) === governingRoute)
}
