"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { MedicineBoxOutlined } from "@ant-design/icons"
import TriageForm from "./triageForm"

export default function TriageContainer() {
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
        <MedicineBoxOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Triage</Title>
      </div>

      <TriageForm />
    </Container>
  )
}
