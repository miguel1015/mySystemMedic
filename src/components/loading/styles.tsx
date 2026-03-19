import { CSSProperties } from "react"

const PRIMARY = "var(--theme-primary, #0F6F5C)"

export const keyframes = `
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }
  @keyframes loadicons {
    0%   { transform: translate(-50%, -50%) scale(0); }
    11%  { transform: translate(-50%, -50%) scale(1.2); }
    22%  { transform: translate(-50%, -50%) scale(1); }
    33%  { transform: translate(-50%, -50%) scale(0); }
  }
`

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  spinnerWrapper: {
    position: "relative",
    width: 60,
    height: 60,
  },

  spinner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: `5px solid ${PRIMARY}`,
    borderLeftColor: "rgba(60,137,232,0.35)",
    animation: "rotate 1s linear infinite",
  },

  icon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "translate(-50%, -50%) scale(0)",
    animation: "loadicons 3s ease-in-out infinite",
  },
}
