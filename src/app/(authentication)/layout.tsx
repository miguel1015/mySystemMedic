import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-vh-100">{children}</div>;
}
