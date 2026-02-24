"use client"

import { Container } from "../../../../components/container"
import Title from "../../../../components/title"
import IpsDataForm from "./ipsDataForm"

export default function IpsDataContainer() {
  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title children="Datos de la IPS" level={3} />
      </div>
      <IpsDataForm />
    </Container>
  )
}
