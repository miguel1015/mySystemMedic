import { CSSProperties } from "react";

const PRIMARY = "#3c89e8";

/**
 * Inyecta animaciones globales y Material Icons UNA sola vez
 */
const injectGlobalStyles = (() => {
  let injected = false;

  return () => {
    if (injected || typeof document === "undefined") return;
    injected = true;

    // Material Icons
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);

    // Keyframes
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes loadicons {
        0% {
          transform: scale(0);
        }
        11% {
          transform: scale(1.2);
        }
        22% {
          transform: scale(1);
        }
        33% {
          transform: scale(0);
        }
      }
    `;
    document.head.appendChild(style);
  };
})();

injectGlobalStyles();

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
    inset: 0,
    margin: "auto",
    width: 24,
    height: 24,
    fontSize: 24,
    color: PRIMARY,
    transform: "scale(0)",
    animation: "loadicons 3s ease-in-out infinite",
  },

  icon1: {
    animationDelay: "0s",
  },

  icon2: {
    animationDelay: "1s",
  },

  icon3: {
    animationDelay: "2s",
  },
};
