"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Button } from "antd"
import { ArrowLeftOutlined, SolutionOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import AdmissionsForm from "@/app/container/care/admissions/admissionsForm"

export default function NewAdmissionPage() {
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
          <SolutionOutlined
            style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }}
          />
          <Title level={3}>Registrar Admision</Title>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/care/admissions")}
        >
          Volver
        </Button>
      </div>

      <AdmissionsForm onDone={() => router.push("/care/admissions")} />
    </Container>
  )
}
