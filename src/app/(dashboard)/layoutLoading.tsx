"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess";
import Loading from "../../components/loading";

interface LayoutLoadingProps {
  userId: number;
  children: React.ReactNode;
}

// Pide el menú y los permisos de navegación a la vez. Antes los permisos se pedían solo
// cuando el menú ya había cargado, y se veía una segunda carga encima del contenido.
// Si los permisos fallan no se bloquea aquí: RouteGuard muestra el error y el reintento.
export default function LayoutLoading({
  userId,
  children,
}: LayoutLoadingProps) {
  const { data, isLoading } = useMenu(userId);
  const { isLoading: loadingAccess } = useNavigationAccess();

  if (isLoading || !data || loadingAccess) {
    return <Loading />;
  }

  return <>{children}</>;
}
