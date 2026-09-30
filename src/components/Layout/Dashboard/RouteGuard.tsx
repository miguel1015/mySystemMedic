"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, Result, Spin } from "antd"
import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess"
import { canAccessRoute } from "@/core/utils/routeAccess"

// Bloquea las vistas del menú que el rol del usuario no tiene permitidas, aunque se
// escriba la URL directamente. Si no se pueden verificar los permisos, no se muestra la vista.
export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { data: access, isLoading, isError, refetch, isFetching } = useNavigationAccess()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !access) {
    return (
      <Result
        status="warning"
        title="No se pudieron verificar tus permisos"
        subTitle="Revisa tu conexión e inténtalo de nuevo."
        extra={
          <Button type="primary" onClick={() => refetch()} loading={isFetching}>
            Reintentar
          </Button>
        }
      />
    )
  }

  if (!canAccessRoute(pathname, access)) {
    return (
      <Result
        status="403"
        title="No tienes acceso a esta vista"
        subTitle="Tu rol no tiene permiso para ver esta página. Si la necesitas, pídele al SuperAdmin que te la habilite."
        extra={
          <Link href="/">
            <Button type="primary">Ir al inicio</Button>
          </Link>
        }
      />
    )
  }

  return <>{children}</>
}
