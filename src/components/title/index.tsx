"use client";

import React from "react";
import classNames from "classnames";

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleWeight = "regular" | "semibold" | "bold";

export interface TitleProps {
  level?: TitleLevel;
  weight?: TitleWeight;
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

export default function Title({
  level = 1,
  weight = "bold",
  eyebrow,
  className,
  children,
  align = "start",
}: TitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <div className={classNames("mb-4", `text-${align}`)}>
      {eyebrow && (
        <div className="text-uppercase small fw-semibold text-primary mb-1 tracking-wide">
          {eyebrow}
        </div>
      )}

      <Tag
        className={classNames(
          {
            "fw-bold": weight === "bold",
            "fw-semibold": weight === "semibold",
            "fw-normal": weight === "regular",
          },
          // Responsivo y atractivo
          "mb-0",
          {
            "display-5": level === 1,
            "display-6": level === 2,
            "fs-2": level === 3,
            "fs-3": level === 4,
            "fs-4": level === 5,
            "fs-5": level === 6,
          },
          className
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
