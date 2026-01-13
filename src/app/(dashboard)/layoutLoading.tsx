"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import Loading from "../../components/loading";

interface LayoutLoadingProps {
  userId: number;
  children: React.ReactNode;
}

export default function LayoutLoading({
  userId,
  children,
}: LayoutLoadingProps) {
  const { data, isLoading } = useMenu(userId);

  if (isLoading || !data) {
    return <Loading />;
  }

  return <>{children}</>;
}
