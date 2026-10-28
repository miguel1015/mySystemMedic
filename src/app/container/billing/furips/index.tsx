"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Alert, Button, Empty, Input, Select, Space, Spin } from "antd"
import { CarOutlined, SearchOutlined } from "@ant-design/icons"
import { useState } from "react"
import toast from "react-hot-toast"
import {
  type FuripsSearchCriteria,
  useSearchFurips,
} from "@/core/hooks/care/furips/useFurips"
import FuripsForm from "./FuripsForm"

type SearchField = "factura" | "admissionId"

const SEARCH_FIELD_OPTIONS = [
  { value: "factura", label: "N° de factura" },
  { value: "admissionId", label: "N° de admisión" },
]

// Facturación edita el FURIPS que se registró en Admisiones: agrega el radicado y los
// amparos que se reclaman, y genera el documento.
export default function FuripsContainer() {
  const [searchField, setSearchField] = useState<SearchField>("factura")
  const [searchTerm, setSearchTerm] = useState("")
  const [criteria, setCriteria] = useState<FuripsSearchCriteria | null>(null)
  const { data: furips, error, isFetching } = useSearchFurips(criteria)

  const handleSearch = () => {
    const term = searchTerm.trim()
    if (!term) {
      toast.error("Ingrese el número de factura o de admisión")
      return
    }
    if (searchField === "admissionId") {
      if (!/^\d+$/.test(term)) {
        toast.error("El número de admisión debe ser numérico")
        return
      }
      setCriteria({ admissionId: Number(term) })
    } else {
      setCriteria({ factura: term })
    }
  }

  return (
    <Container>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <CarOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>FURIPS</Title>
      </div>

      <Space.Compact style={{ width: "100%", maxWidth: 640, marginBottom: 16 }}>
        <Select
          size="large"
          value={searchField}
          options={SEARCH_FIELD_OPTIONS}
          onChange={(value: SearchField) => setSearchField(value)}
          style={{ width: 200 }}
        />
        <Input
          size="large"
          placeholder={
            searchField === "factura" ? "Ej: FE11186" : "Ingrese el número de admisión"
          }
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button
          size="large"
          type="primary"
          icon={<SearchOutlined />}
          loading={isFetching}
          onClick={handleSearch}
        >
          Buscar
        </Button>
      </Space.Compact>

      {!criteria ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Busque el FURIPS por número de factura o de admisión"
          style={{ padding: 40 }}
        />
      ) : isFetching && !furips ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="warning" showIcon message={error.message} />
      ) : furips ? (
        <FuripsForm key={furips.admissionId} admissionId={furips.admissionId} mode="billing" />
      ) : null}
    </Container>
  )
}
