"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface ClinicalRecordPlaceholderProps {
  title: string
  icon: ReactNode
}

const ClinicalRecordPlaceholder = ({
  title,
  icon,
}: ClinicalRecordPlaceholderProps) => {
  const router = useRouter()

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--theme-primary, #0F6F5C)", fontSize: 22 }}>
            {icon}
          </span>
          <Title level={3}>{title}</Title>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div
        style={{
          minHeight: 360,
          border: "1px solid var(--dash-border, #e5e7eb)",
          borderRadius: 8,
          backgroundColor: "var(--dash-surface, #ffffff)",
        }}
      />
    </Container>
  )
}

export default ClinicalRecordPlaceholder
