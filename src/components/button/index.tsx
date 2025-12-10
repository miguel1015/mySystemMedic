"use client";

import {
  ReactNode,
  MouseEventHandler,
  CSSProperties,
  MouseEvent,
  useRef,
} from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost"
  | "link"
  | "soft"
  | "gradient"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg";

export interface CustomButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
}

export default function CustomButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  ripple = true,
  onClick,
  children,
  className = "",
}: CustomButtonProps) {
  const isDisabled = disabled || loading;
  const btnRef = useRef<HTMLButtonElement>(null);

  // --------------------------
  // Ripple Effect
  // --------------------------
  function createRipple(e: MouseEvent<HTMLButtonElement>) {
    if (!ripple || isDisabled) return;

    const btn = btnRef.current;
    if (!btn) return;

    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;

    // Ripple Styling Inline
    circle.style.position = "absolute";
    circle.style.borderRadius = "50%";
    circle.style.background = "rgba(255,255,255,0.35)";
    circle.style.transform = "scale(0)";
    circle.style.pointerEvents = "none";
    circle.style.animation = "ripple-animation 0.6s ease-out";
    circle.style.zIndex = "1";

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  // Create ripple keyframes dynamically (only once)
  if (
    typeof document !== "undefined" &&
    !document.getElementById("ripple-keyframes")
  ) {
    const style = document.createElement("style");
    style.id = "ripple-keyframes";
    style.innerHTML = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      @keyframes spin-animation {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // --------------------------
  // Bootstrap variants mapped
  // --------------------------
  const variantClass = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    danger: "btn btn-danger",
    outline: "btn btn-outline-primary",
    ghost: "btn btn-light border-0",
    link: "btn btn-link p-0",
    soft: "btn btn-primary bg-opacity-10 border-primary border-opacity-25 text-primary",
    gradient: "btn text-white border-0",
    icon: "btn btn-primary rounded-circle p-0 d-flex justify-content-center align-items-center",
  }[variant];

  // --------------------------
  // Sizes
  // --------------------------
  const sizeClass = { sm: "btn-sm", md: "", lg: "btn-lg" }[size];

  // --------------------------
  // Extra styles
  // --------------------------
  const customStyle: CSSProperties = {};
  if (variant === "gradient") {
    customStyle.background = "linear-gradient(135deg, #0d6efd, #6741d9)";
  }
  if (variant === "icon") {
    customStyle.width = "36px";
    customStyle.height = "36px";
  }

  return (
    <button
      ref={btnRef}
      disabled={isDisabled}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      className={`
        ${variantClass}
        ${sizeClass}
        ${fullWidth ? "w-100" : ""}
        position-relative
        d-inline-flex
        justify-content-center
        align-items-center
        gap-2
        overflow-hidden
        ${className}
      `}
      style={customStyle}
    >
      {loading && (
        <Loader2
          size={25}
          style={{
            animation: "spin-animation 1s linear infinite",
            transformOrigin: "center",
            transformBox: "fill-box",
            zIndex: 2,
          }}
        />
      )}
      <span
        style={{
          animation: loading ? "fadeLoop 1.2s ease-in-out infinite" : "none",
          fontSize: "1.05em",
          fontWeight: 500,
          letterSpacing: "0.3px",
          display: "inline-block",
          transformOrigin: "center",
          zIndex: 2,
        }}
      >
        {children}
      </span>
    </button>
  );
}
