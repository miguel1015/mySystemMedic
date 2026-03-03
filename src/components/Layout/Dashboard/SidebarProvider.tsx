"use client"

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react"
import { useThemeColor } from "@/themes/antdTheme"

type SidebarType = "dark" | "transparent" | "white"

type SidebarContextType = {
  showSidebarState: [boolean, Dispatch<SetStateAction<boolean>>];
  sidebarColor: string;
  setSidebarColor: (c: string) => void;
  sidebarType: SidebarType;
  setSidebarType: Dispatch<SetStateAction<SidebarType>>;
}

export const SidebarContext = createContext<SidebarContextType>({
  showSidebarState: [false, () => {}],
  sidebarColor: "#0F6F5C",
  setSidebarColor: () => {},
  sidebarType: "dark",
  setSidebarType: () => {},
})

export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isShowSidebar, setIsShowSidebar] = useState(false)
  const { themeColor, setThemeColor } = useThemeColor()
  const [sidebarType, setSidebarType] = useState<SidebarType>("dark")

  // Persistencia de sidebarType
  useEffect(() => {
    const storedType = localStorage.getItem("sidebarType") as SidebarType | null
    if (storedType) setSidebarType(storedType)
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebarType", sidebarType)
  }, [sidebarType])

  const value: SidebarContextType = useMemo(
    () => ({
      showSidebarState: [isShowSidebar, setIsShowSidebar],
      sidebarColor: themeColor,
      setSidebarColor: setThemeColor,
      sidebarType,
      setSidebarType,
    }),
    [isShowSidebar, themeColor, setThemeColor, sidebarType],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const sidebar = useContext(SidebarContext)
  if (sidebar === null) {
    throw new Error("useSidebar hook must be used within SidebarProvider")
  }
  return sidebar
}
