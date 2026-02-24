"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import GridContainer from "@/components/componentLayout";

export default function UserFormSkeleton() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = Cookies.get("theme");
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  const lightGradient = `
    linear-gradient(
      90deg,
      #e0e0e0 0%,
      #f5f5f5 50%,
      #e0e0e0 100%
    )
  `;

  const darkGradient = `
    linear-gradient(
      90deg,
      rgba(255,255,255,0.10) 0%,
      rgba(255,255,255,0.22) 50%,
      rgba(255,255,255,0.10) 100%
    )
  `;

  // 🔥 FIX: Usamos propiedades separadas, nada de shorthand
  const skeletonStyle = {
    backgroundImage: theme === "dark" ? darkGradient : lightGradient,
    backgroundSize: "200% 100%",
    animation: "skeleton-loading 1.3s ease-in-out infinite",
    borderRadius: 6,
  };

  return (
    <>
      <style>
        {`
          @keyframes skeleton-loading {
            0% { background-position-x: 200%; }
            100% { background-position-x: -200%; }
          }
        `}
      </style>

      <div>
        <GridContainer gap="g-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div
                className="skeleton"
                style={{
                  width: 140,
                  height: 18,
                  marginBottom: 8,
                  ...skeletonStyle,
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 42,
                  ...skeletonStyle,
                }}
              />
            </div>
          ))}
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <div
            className="skeleton"
            style={{ width: 100, height: 40, ...skeletonStyle }}
          />
          <div
            className="skeleton"
            style={{ width: 140, height: 40, ...skeletonStyle }}
          />
        </div>
      </div>
    </>
  );
}
