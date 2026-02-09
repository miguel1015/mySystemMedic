"use client"

import { useState } from "react"
import { Button } from "antd"
import { Container } from "../../../../components/container"
import Title from "../../../../components/title"
import IpsDataForm from "./ipsDataForm"

export default function IpsDataContainer() {
  const [openResolution, setOpenResolution] = useState(false)

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title children="Datos de la IPS" level={3} />
        <Button type="primary" onClick={() => setOpenResolution(true)}>
          Nueva Resolución
        </Button>
      </div>
      <IpsDataForm
        openResolution={openResolution}
        setOpenResolution={setOpenResolution}
      />
    </Container>
  )
}
