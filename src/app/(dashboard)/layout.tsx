import Header from "@/components/Layout/Dashboard/Header/Header";
import Sidebar from "@/components/Layout/Dashboard/Sidebar/Sidebar";
import SidebarNav from "@/components/Layout/Dashboard/Sidebar/SidebarNav";
import SidebarOverlay from "@/components/Layout/Dashboard/Sidebar/SidebarOverlay";
import SidebarProvider from "@/components/Layout/Dashboard/SidebarProvider";
import { getServerSession } from "next-auth";
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
        <div className="wrapper dash-layout-wrapper">
          <Header />
          <div className="dash-content-area">
            <div className="dash-content-inner">{children}</div>
          </div>
        </div>
        <SidebarOverlay />
      </SidebarProvider>
    </LayoutLoading>
  );
}
