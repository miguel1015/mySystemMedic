"use client";

import React, { ReactNode } from "react";
import clsx from "clsx";
import "./container.css";
import { Theme } from "@/themes/enum";

interface ContainerProps {
  children: ReactNode;
  fluid?: boolean | "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: boolean | "sm" | "lg";
  rounded?: boolean | "sm" | "lg" | "circle" | "pill";
  animated?: boolean;
  centered?: boolean;
  minHeight?: string;
  theme?: Theme;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  className,
  padding = "md",
  shadow = false,
  rounded = false,
  animated = false,
  centered = false,
  minHeight,
  theme,
}) => {
  const containerClass = fluid
    ? typeof fluid === "string"
      ? `container-${fluid}`
      : "container-fluid"
    : "container";

  const paddingMap = {
    none: "p-0",
    sm: "p-2",
    md: "p-3 p-md-4",
    lg: "p-4 p-md-5",
    xl: "p-5 p-md-6",
  };

  const classes = clsx(
    containerClass,
    "container-base",
    `theme-${theme}`,
    paddingMap[padding],
    shadow ? (typeof shadow === "string" ? `shadow-${shadow}` : "shadow") : "",
    rounded
      ? typeof rounded === "string"
        ? `rounded-${rounded}`
        : "rounded"
      : "",
    centered ? "d-flex align-items-center justify-content-center" : "",
    animated ? "container-animated" : "",
    className
  );

  return (
    <div className={classes} style={{ minHeight }}>
      {children}
    </div>
  );
};
