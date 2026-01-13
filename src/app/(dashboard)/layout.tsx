import Header from "@/components/Layout/Dashboard/Header/Header";
import Sidebar from "@/components/Layout/Dashboard/Sidebar/Sidebar";
import SidebarNav from "@/components/Layout/Dashboard/Sidebar/SidebarNav";
import SidebarOverlay from "@/components/Layout/Dashboard/Sidebar/SidebarOverlay";
import SidebarProvider from "@/components/Layout/Dashboard/SidebarProvider";
import { getServerSession } from "next-auth";
import { Container } from "react-bootstrap";
import { authOptions } from "../api/auth/option";
import LayoutLoading from "./layoutLoading";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user.id);

  return (
    <LayoutLoading userId={userId}>
      <SidebarProvider>
        <SidebarOverlay />
        <Sidebar>
          <SidebarNav id={userId} />
        </Sidebar>
        <div className="wrapper d-flex flex-column min-vh-100">
          <Header />
          <div className="body flex-grow-1 px-sm-2 mb-4">
            <Container fluid="lg">{children}</Container>
          </div>
        </div>
        <SidebarOverlay />
      </SidebarProvider>
    </LayoutLoading>
  );
}
