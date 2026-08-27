"use client"

import Modal from "@/components/modal"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import { UserProfile } from "@/core/interfaces/user/users"
import { CheckOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Empty, Input, Select, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { SelectedSurgicalService } from "./useSurgicalChargeForm"

interface SurgicalServiceModalProps {
  open: boolean
  onClose: () => void
  tariffId: number | null
  tariffDetails: TTariffDetail[]
  profiles: UserProfile[]
  loadingProfiles: boolean
  specialty: string | null
  onSpecialtyChange: (specialty: string | null) => void
  onSelect: (service: SelectedSurgicalService) => void
}

const SurgicalServiceModal = ({
  open,
  onClose,
  tariffId,
  tariffDetails,
  profiles,
  loadingProfiles,
  specialty,
  onSpecialtyChange,
  onSelect,
}: SurgicalServiceModalProps) => {
  const [search, setSearch] = useState("")

  const specialtyOptions = profiles.map((p) => ({ value: p.name, label: p.name }))

  const surgicalServices = useMemo(
    () => tariffDetails.filter((d) => d.isSurgicalProcedure && d.tariffId === tariffId),
    [tariffDetails, tariffId],
  )

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return surgicalServices
    return surgicalServices.filter(
      (s) =>
        String(s.referenceCode).toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term),
    )
  }, [surgicalServices, search])

  const columns: ColumnsType<TTariffDetail> = [
    { title: "Código SOAT", dataIndex: "referenceCode", width: 120 },
    { title: "Nombre del servicio", dataIndex: "description" },
    {
      title: "Grupo QX",
      dataIndex: "surgicalGroupQxGroup",
      width: 120,
      render: (value?: string) => value ?? "-",
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() =>
            onSelect({
              tariffDetailId: record.id,
              code: record.referenceCode,
              name: record.description,
              surgicalGroupId: record.surgicalGroupId,
              surgicalGroupQxGroup: record.surgicalGroupQxGroup ?? null,
            })
          }
        >
          Seleccionar
        </Button>
      ),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Buscar servicio quirúrgico" size="lg">
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Especialidad médica
        </label>
        <Select
          value={specialty ?? undefined}
          onChange={(value) => onSpecialtyChange(value ?? null)}
          options={specialtyOptions}
          loading={loadingProfiles}
          placeholder="Seleccione la especialidad"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: "100%" }}
        />
      </div>

      <Input
        placeholder="Buscar por código SOAT o nombre de la cirugía..."
        prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        disabled={!tariffId}
        style={{ marginBottom: 14 }}
      />

      {!tariffId && (
        <div style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 12 }}>
          Seleccione primero un tarifario quirúrgico para buscar el servicio.
        </div>
      )}

      <Table<TTariffDetail>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={filteredServices}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 560 }}
        locale={{ emptyText: <Empty description="Sin resultados" /> }}
      />
    </Modal>
  )
}

export default SurgicalServiceModal
