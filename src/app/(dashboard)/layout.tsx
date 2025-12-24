import Header from "@/components/Layout/Dashboard/Header/Header";
import Sidebar from "@/components/Layout/Dashboard/Sidebar/Sidebar";
import SidebarNav from "@/components/Layout/Dashboard/Sidebar/SidebarNav";
import SidebarOverlay from "@/components/Layout/Dashboard/Sidebar/SidebarOverlay";
import SidebarProvider from "@/components/Layout/Dashboard/SidebarProvider";
import { getServerSession } from "next-auth";
import React from "react";
import { Container } from "react-bootstrap";
import { authOptions } from "../api/auth/option";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  console.log(session);
  return (
    <SidebarProvider>
      <SidebarOverlay />
      <Sidebar>
        <SidebarNav idRole={Number(session?.user.role)} />
      </Sidebar>
      <div className="wrapper d-flex flex-column min-vh-100">
        <Header />
        <div className="body flex-grow-1 px-sm-2 mb-4">
          <Container fluid="lg">{children}</Container>
        </div>
      </div>
      <SidebarOverlay />
    </SidebarProvider>
  );
}
