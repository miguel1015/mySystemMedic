export interface ThemeColorPalette {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  sidebarBg: string;
  sidebarBgDark: string;
  sidebarBorderColor: string;
  sidebarBorderColorDark: string;
  sidebarBrandBg: string;
  sidebarBrandBgDark: string;
  sidebarLinkHoverBg: string;
  sidebarTogglerBg: string;
  sidebarTogglerBgDark: string;
  sidebarTogglerBgHover: string;
}

export const COLOR_PALETTES: Record<string, ThemeColorPalette> = {
  green: {
    primary: "#0F6F5C",
    primaryHover: "#0d5f4f",
    primaryActive: "#0a4f42",
    sidebarBg: "#1F3D36",
    sidebarBgDark: "#141F1C",
    sidebarBorderColor: "#234B42",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(15,111,92,0.25)",
    sidebarBrandBgDark: "rgba(15,111,92,0.35)",
    sidebarLinkHoverBg: "rgba(15,111,92,0.18)",
    sidebarTogglerBg: "rgba(15,111,92,0.22)",
    sidebarTogglerBgDark: "rgba(15,111,92,0.30)",
    sidebarTogglerBgHover: "rgba(15,111,92,0.35)",
  },
  blue: {
    primary: "#0d6efd",
    primaryHover: "#0b5ed7",
    primaryActive: "#0a58ca",
    sidebarBg: "#1a2d4a",
    sidebarBgDark: "#111d33",
    sidebarBorderColor: "#263f5f",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(13,110,253,0.25)",
    sidebarBrandBgDark: "rgba(13,110,253,0.35)",
    sidebarLinkHoverBg: "rgba(13,110,253,0.18)",
    sidebarTogglerBg: "rgba(13,110,253,0.22)",
    sidebarTogglerBgDark: "rgba(13,110,253,0.30)",
    sidebarTogglerBgHover: "rgba(13,110,253,0.35)",
  },
  indigo: {
    primary: "#6366f1",
    primaryHover: "#5558d9",
    primaryActive: "#4a4dc2",
    sidebarBg: "#2a2547",
    sidebarBgDark: "#1a1730",
    sidebarBorderColor: "#3b355f",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(99,102,241,0.25)",
    sidebarBrandBgDark: "rgba(99,102,241,0.35)",
    sidebarLinkHoverBg: "rgba(99,102,241,0.18)",
    sidebarTogglerBg: "rgba(99,102,241,0.22)",
    sidebarTogglerBgDark: "rgba(99,102,241,0.30)",
    sidebarTogglerBgHover: "rgba(99,102,241,0.35)",
  },
  pink: {
    primary: "#d63384",
    primaryHover: "#b82b70",
    primaryActive: "#9a245e",
    sidebarBg: "#3d1f2e",
    sidebarBgDark: "#2a141f",
    sidebarBorderColor: "#52293e",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(214,51,132,0.25)",
    sidebarBrandBgDark: "rgba(214,51,132,0.35)",
    sidebarLinkHoverBg: "rgba(214,51,132,0.18)",
    sidebarTogglerBg: "rgba(214,51,132,0.22)",
    sidebarTogglerBgDark: "rgba(214,51,132,0.30)",
    sidebarTogglerBgHover: "rgba(214,51,132,0.35)",
  },
  orange: {
    primary: "#fd7e14",
    primaryHover: "#d96b11",
    primaryActive: "#b6590e",
    sidebarBg: "#3d2e1a",
    sidebarBgDark: "#2a1f11",
    sidebarBorderColor: "#523d23",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(253,126,20,0.25)",
    sidebarBrandBgDark: "rgba(253,126,20,0.35)",
    sidebarLinkHoverBg: "rgba(253,126,20,0.18)",
    sidebarTogglerBg: "rgba(253,126,20,0.22)",
    sidebarTogglerBgDark: "rgba(253,126,20,0.30)",
    sidebarTogglerBgHover: "rgba(253,126,20,0.35)",
  },
  red: {
    primary: "#dc3545",
    primaryHover: "#bb2d3b",
    primaryActive: "#a52834",
    sidebarBg: "#3d1f22",
    sidebarBgDark: "#2a1416",
    sidebarBorderColor: "#52292d",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(220,53,69,0.25)",
    sidebarBrandBgDark: "rgba(220,53,69,0.35)",
    sidebarLinkHoverBg: "rgba(220,53,69,0.18)",
    sidebarTogglerBg: "rgba(220,53,69,0.22)",
    sidebarTogglerBgDark: "rgba(220,53,69,0.30)",
    sidebarTogglerBgHover: "rgba(220,53,69,0.35)",
  },
  teal: {
    primary: "#0891b2",
    primaryHover: "#077d9a",
    primaryActive: "#066a83",
    sidebarBg: "#1a3340",
    sidebarBgDark: "#11222c",
    sidebarBorderColor: "#234455",
    sidebarBorderColorDark: "rgba(255,255,255,0.08)",
    sidebarBrandBg: "rgba(8,145,178,0.25)",
    sidebarBrandBgDark: "rgba(8,145,178,0.35)",
    sidebarLinkHoverBg: "rgba(8,145,178,0.18)",
    sidebarTogglerBg: "rgba(8,145,178,0.22)",
    sidebarTogglerBgDark: "rgba(8,145,178,0.30)",
    sidebarTogglerBgHover: "rgba(8,145,178,0.35)",
  },
}

export const DEFAULT_THEME_COLOR = "green"

export function getPaletteByPrimary(hex: string): ThemeColorPalette {
  const found = Object.values(COLOR_PALETTES).find((p) => p.primary === hex)
  return found ?? COLOR_PALETTES[DEFAULT_THEME_COLOR]
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
