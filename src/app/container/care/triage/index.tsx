"use client"

import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { Button } from "antd"
import { MedicineBoxOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import TriageTable from "./table"
import { useGetAllTriages } from "@/core/hooks/care/triage/useGetAllTriages"

export default function TriageContainer() {
  const router = useRouter()
  const { data: triages, isLoading, isError, refetch } = useGetAllTriages()
  const total = triages?.length ?? 0

  return (
    <Container>
      <PageHeader
        icon={<MedicineBoxOutlined />}
        title="Triage"
        subtitle={
          isLoading
            ? "Cargando triages…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "triage registrado" : "triages registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/care/triage/new")}>
            Registrar triage
          </Button>
        }
      />

      <TriageTable
        data={triages ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </Container>
  )
}
