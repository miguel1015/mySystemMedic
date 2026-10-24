"use client"

import { CSSProperties, useMemo } from "react"
import { theme } from "antd"

// Colores del tema de antd (claro u oscuro) como variables CSS para admissionNotifications.scss.
export function useThemeVars() {
  const { token } = theme.useToken()

  return useMemo(
    () =>
      ({
        "--anc-bg": token.colorBgContainer,
        "--anc-bg-elevated": token.colorBgElevated,
        "--anc-fill": token.colorFillQuaternary,
        "--anc-fill-strong": token.colorFillTertiary,
        "--anc-border": token.colorBorderSecondary,
        "--anc-text": token.colorText,
        "--anc-text-2": token.colorTextSecondary,
        "--anc-text-3": token.colorTextTertiary,
        "--anc-primary": token.colorPrimary,
        "--anc-danger": token.colorError,
        "--anc-warning": token.colorWarning,
        "--anc-success": token.colorSuccess,
      }) as CSSProperties,
    [token],
  )
}
