"use client";

import {
  ReactNode,
  MouseEventHandler,
  CSSProperties,
  useRef,
  MouseEvent,
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
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
  ripple?: boolean;
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
}: CustomButtonProps) {
  const isDisabled = disabled || loading;
  const btnRef = useRef<HTMLButtonElement>(null);

  const baseStyle: CSSProperties = {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    borderRadius: "8px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    gap: "6px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.2s ease",
    width: fullWidth ? "100%" : undefined,
    userSelect: "none",
    lineHeight: 1,
  };

  // Variants
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      backgroundColor: "#0d6efd",
      color: "#fff",
      border: "1px solid #0a58ca",
    },
    secondary: {
      backgroundColor: "#fff",
      color: "#444",
      border: "1px solid #ccc",
    },
    danger: {
      backgroundColor: "#dc3545",
      color: "#fff",
      border: "1px solid #b02a37",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#0d6efd",
      border: "1px solid #0d6efd",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#0d6efd",
      border: "none",
    },
    link: {
      backgroundColor: "transparent",
      color: "#0d6efd",
      border: "none",
      padding: 0,
    },
    soft: {
      backgroundColor: "#e7f1ff",
      color: "#0d6efd",
      border: "1px solid #bfd7ff",
    },
    gradient: {
      background: "linear-gradient(135deg, #0d6efd, #6741d9)",
      color: "white",
      border: "none",
    },
    icon: {
      width: "32px",
      height: "32px",
      padding: 0,
      borderRadius: "50%",
      backgroundColor: "#0d6efd",
      color: "white",
      border: "1px solid #0b5ed7",
    },
  };

  const sizes: Record<ButtonSize, CSSProperties> = {
    sm: { padding: "4px 10px", height: "30px", fontSize: "0.75rem" },
    md: { padding: "4px 12px", height: "40px", fontSize: "0.85rem" },
    lg: { padding: "6px 14px", height: "40px", fontSize: "0.95rem" },
  };

  // Ripple
  function createRipple(e: MouseEvent<HTMLButtonElement>) {
    if (!ripple || isDisabled) return;

    const btn = btnRef.current;
    if (!btn) return;

    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.position = "absolute";
    circle.style.borderRadius = "50%";
    circle.style.background = "rgba(255, 255, 255, 0.35)";
    circle.style.animation = "ripple-effect 0.6s ease-out";
    circle.style.left = `${e.clientX - btn.offsetLeft - diameter / 2}px`;
    circle.style.top = `${e.clientY - btn.offsetTop - diameter / 2}px`;

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  return (
    <button
      ref={btnRef}
      disabled={isDisabled}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...(variant !== "icon" ? sizes[size] : {}),
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
