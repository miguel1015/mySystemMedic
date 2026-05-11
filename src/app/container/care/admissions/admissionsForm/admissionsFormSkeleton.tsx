"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import GridContainer from "@/components/componentLayout"
import { Divider } from "antd"
import { FileSearchOutlined, SolutionOutlined } from "@ant-design/icons"

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border-subtle, #f0f0f3)",
  borderRadius: 10,
  padding: "20px 24px",
  marginBottom: 20,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--theme-primary, #0F6F5C)",
  marginBottom: 4,
  marginTop: 0,
  display: "flex",
  alignItems: "center",
  gap: 8,
}

export default function AdmissionsFormSkeleton() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const t = Cookies.get("theme")
    setTheme(t === "dark" ? "dark" : "light")
  }, [])

  const lightGradient = `
    linear-gradient(
      90deg,
      #e0e0e0 0%,
      #f5f5f5 50%,
      #e0e0e0 100%
    )
  `

  const darkGradient = `
    linear-gradient(
      90deg,
      rgba(255,255,255,0.10) 0%,
      rgba(255,255,255,0.22) 50%,
      rgba(255,255,255,0.10) 100%
    )
  `

  const skeletonStyle: React.CSSProperties = {
    backgroundImage: theme === "dark" ? darkGradient : lightGradient,
    backgroundSize: "200% 100%",
    animation: "skeleton-loading 1.3s ease-in-out infinite",
    borderRadius: 6,
  }

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

      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          <FileSearchOutlined />
          Paciente
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div
                className="skeleton"
                style={{
                  width: 90,
                  height: 16,
                  marginBottom: 8,
                  ...skeletonStyle,
                }}
              />
              <div
                className="skeleton"
                style={{
                  width: i === 0 ? 140 : 220,
                  height: 22,
                  ...skeletonStyle,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          <SolutionOutlined />
          Informacion de Admision
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />

        <GridContainer columns="col-3" gap="g-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div
                className="skeleton"
                style={{
                  width: 150,
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
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <div
          className="skeleton"
          style={{ width: 100, height: 40, ...skeletonStyle }}
        />
        <div
          className="skeleton"
          style={{ width: 170, height: 40, ...skeletonStyle }}
        />
      </div>
    </>
  )
}
