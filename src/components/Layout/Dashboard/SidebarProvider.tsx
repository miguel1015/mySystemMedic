"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

type SidebarType = "dark" | "transparent" | "white";

type SidebarContextType = {
  showSidebarState: [boolean, Dispatch<SetStateAction<boolean>>];
  sidebarColor: string;
  setSidebarColor: Dispatch<SetStateAction<string>>;
  sidebarType: SidebarType;
  setSidebarType: Dispatch<SetStateAction<SidebarType>>;
};

export const SidebarContext = createContext<SidebarContextType>({
  showSidebarState: [false, () => {}],
  sidebarColor: "#0F6F5C",
  setSidebarColor: () => {},
  sidebarType: "dark",
  setSidebarType: () => {},
});

export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const [sidebarColor, setSidebarColor] = useState("#0F6F5C");
  const [sidebarType, setSidebarType] = useState<SidebarType>("dark");

  // Persistencia
  useEffect(() => {
    const storedColor = localStorage.getItem("sidebarColor");
    const storedType = localStorage.getItem(
      "sidebarType",
    ) as SidebarType | null;
    if (storedColor) setSidebarColor(storedColor);
    if (storedType) setSidebarType(storedType);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarColor", sidebarColor);
    localStorage.setItem("sidebarType", sidebarType);
  }, [sidebarColor, sidebarType]);

  const value: SidebarContextType = useMemo(
    () => ({
      showSidebarState: [isShowSidebar, setIsShowSidebar],
      sidebarColor,
      setSidebarColor,
      sidebarType,
      setSidebarType,
    }),
    [isShowSidebar, sidebarColor, sidebarType],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const sidebar = useContext(SidebarContext);
  if (sidebar === null) {
    throw new Error("useSidebar hook must be used within SidebarProvider");
  }
  return sidebar;
};
