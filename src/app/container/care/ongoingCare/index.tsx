"use client"

import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { useOngoingAttentions } from "@/core/hooks/care/admissions/useGetOngoingAttentions"
import { HeartOutlined } from "@ant-design/icons"
import OngoingCareTable from "./table"

const OngoingCareContainer = () => {
  const { data: attentions = [], isLoading, isError, refetch } = useOngoingAttentions()
  const total = attentions.length

  return (
    <Container>
      <PageHeader
        icon={<HeartOutlined />}
        title="Atenciones en curso"
        subtitle={
          isLoading
            ? "Cargando atenciones…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "paciente con atención activa" : "pacientes con atención activa"}`
        }
      />

      <OngoingCareTable
        data={attentions}
        loading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </Container>
  )
}

export default OngoingCareContainer
