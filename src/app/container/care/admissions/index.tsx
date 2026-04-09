"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { SolutionOutlined } from "@ant-design/icons"
import AdmissionsForm from "./admissionsForm"

export default function AdmissionsContainer() {
  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <SolutionOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Admisión</Title>
      </div>

      <AdmissionsForm />
    </Container>
  )
}
