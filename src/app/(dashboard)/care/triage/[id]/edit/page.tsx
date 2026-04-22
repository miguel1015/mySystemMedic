"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Button, Spin } from "antd"
import { ArrowLeftOutlined, MedicineBoxOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import TriageForm from "@/app/container/care/triage/triageForm"
import { useGetTriageById } from "@/core/hooks/care/triage/useGetTriageById"

interface Props {
  params: { id: string }
}

export default function EditTriagePage({ params }: Props) {
  const router = useRouter()
  const { data, isLoading, isError } = useGetTriageById(params.id)

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
          <Title level={3}>Editar Triage</Title>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/care/triage/${params.id}`)}
        >
          Volver
        </Button>
      </div>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {isError && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 40,
            gap: 16,
          }}
        >
          <p>No se pudo cargar el triaje.</p>
          <Button onClick={() => router.push("/care/triage")}>
            Volver al listado
          </Button>
        </div>
      )}

      {data && <TriageForm mode="edit" initialTriage={data} />}
    </Container>
  )
}
