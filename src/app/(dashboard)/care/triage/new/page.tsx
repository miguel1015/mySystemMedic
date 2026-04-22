"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Button } from "antd"
import { ArrowLeftOutlined, MedicineBoxOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import TriageForm from "@/app/container/care/triage/triageForm"

export default function NewTriagePage() {
  const router = useRouter()

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MedicineBoxOutlined
            style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }}
          />
          <Title level={3}>Registrar Triage</Title>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/care/triage")}
        >
          Volver
        </Button>
      </div>

      <TriageForm mode="create" />
    </Container>
  )
}
