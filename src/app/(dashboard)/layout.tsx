import Header from "@/components/Layout/Dashboard/Header/Header";
import Sidebar from "@/components/Layout/Dashboard/Sidebar/Sidebar";
import SidebarNav from "@/components/Layout/Dashboard/Sidebar/SidebarNav";
import SidebarOverlay from "@/components/Layout/Dashboard/Sidebar/SidebarOverlay";
import SidebarProvider from "@/components/Layout/Dashboard/SidebarProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/option";
import LayoutLoading from "./layoutLoading";
import { styles } from "./styles";

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
        <div className="wrapper" style={styles.header}>
          <Header />
          <div style={styles.containerChildren}>
            <div style={styles.contentChildren}>{children}</div>
          </div>
        </div>
        <SidebarOverlay />
      </SidebarProvider>
    </LayoutLoading>
  );
}
