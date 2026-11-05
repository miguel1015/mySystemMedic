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

const COLLAPSED_KEY = "sidebarCollapsed"

export function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
}

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

  // OJO: `isShowSidebar` se lee distinto según el ancho. En escritorio (≥ 768 px) el menú
  // se ve por defecto y `true` lo OCULTA; en celular está oculto y `true` lo MUESTRA.
  // Solo se recuerda el estado de escritorio: en celular el menú siempre arranca cerrado.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches
    if (desktop && localStorage.getItem(COLLAPSED_KEY) === "1") setIsShowSidebar(true)
  }, [])

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      localStorage.setItem(COLLAPSED_KEY, isShowSidebar ? "1" : "0")
    }
  }, [isShowSidebar])

  // Ctrl + B (⌘ + B en Mac) abre y cierra el menú. No actúa mientras se escribe en un
  // campo, donde Ctrl + B puede significar negrita.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "b" || e.shiftKey || e.altKey) return
      if (isEditable(e.target)) return
      e.preventDefault()
      setIsShowSidebar((v) => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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
