import Sidebar from "@/components/Layout/Dashboard/Sidebar/Sidebar";
import SidebarAccount from "@/components/Layout/Dashboard/Sidebar/SidebarAccount";
import SidebarEdgeTab from "@/components/Layout/Dashboard/Sidebar/SidebarEdgeTab";
import SidebarNav from "@/components/Layout/Dashboard/Sidebar/SidebarNav";
import SidebarOverlay from "@/components/Layout/Dashboard/Sidebar/SidebarOverlay";
import SidebarProvider from "@/components/Layout/Dashboard/SidebarProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/option";
import LayoutLoading from "./layoutLoading";
import getTheme from "@/themes/theme";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user.id);
  const currentTheme = getTheme();

  return (
    <LayoutLoading userId={userId}>
      <SidebarProvider>
        <SidebarOverlay />
        <Sidebar>
          <div className="sidebar-nav flex-fill">
            <SidebarNav id={userId} />
          </div>
          <SidebarAccount
            initialTheme={currentTheme}
            user={session?.user ?? {}}
          />
        </Sidebar>
        <div className="wrapper dash-layout-wrapper">
          <div className="dash-content-area">
            <div className="dash-content-inner">{children}</div>
          </div>
        </div>
        <SidebarEdgeTab />
        <SidebarOverlay />
      </SidebarProvider>
    </LayoutLoading>
  );
}
