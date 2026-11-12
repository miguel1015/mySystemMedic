"use client"

import { Container } from "../../../../components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { HomeOutlined } from "@ant-design/icons"
import IpsDataForm from "./ipsDataForm"

export default function IpsDataContainer() {
  return (
    <Container>
      <PageHeader
        icon={<HomeOutlined />}
        title="Datos de la IPS"
        subtitle="Información de la institución que aparece en los documentos impresos y en el RIPS"
      />
      <IpsDataForm />
    </Container>
  )
}
