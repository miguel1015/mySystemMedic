"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useOngoingAttentions } from "@/core/hooks/care/admissions/useGetOngoingAttentions"
import { HeartOutlined } from "@ant-design/icons"
import OngoingCareTable from "./table"

const OngoingCareContainer = () => {
  const { data: attentions = [], isLoading } = useOngoingAttentions()

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <HeartOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Atenciones en curso</Title>
      </div>

      <p style={{ color: "#666", marginBottom: 24, marginTop: -8 }}>
        Pacientes con una atención activa, agrupados por ámbito asistencial actual
      </p>

      <OngoingCareTable data={attentions} loading={isLoading} />
    </Container>
  )
}

export default OngoingCareContainer
