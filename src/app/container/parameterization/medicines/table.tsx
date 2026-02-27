"use client"

import { Container } from "@/components/container"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import { Button, Input, Space, Table, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  FormOutlined,
  MedicineBoxOutlined,
  ScissorOutlined,
} from "@ant-design/icons"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { TMedicine } from "../../../../core/interfaces/parameterization/types"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useDeleteMedicine } from "@/core/hooks/parameterization/medicines/useDeleteMedicine"

interface MedicineProps {
  onEdit: (id: number) => void
}

const MedicineTable = ({ onEdit }: MedicineProps) => {
  const { data: dataMedicines = [], isLoading } = useMedicines()
  const deleteMedicine = useDeleteMedicine()

  const [search, setSearch] = useState("")
  const [openConfirm, setOpenConfirm] = useState(false)
  const [medicineToDelete, setMedicineToDelete] = useState<number | null>(null)

  const filteredMedicines = useMemo<TMedicine[]>(() => {
    const term = search.toLowerCase()
    return dataMedicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.cum.toLowerCase().includes(term) ||
        String(m.id).includes(term),
    )
  }, [search, dataMedicines])

  const columns: ColumnsType<TMedicine> = [
    {
      title: "#",
      width: 20,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 20,
      sorter: (a, b) => a.id! - b.id!,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      width: "auto",
    },
    {
      title: "CUM",
      dataIndex: "cum",
      width: "auto",
    },
    {
      title: "Concentración",
      dataIndex: "concentration",
      width: "auto",
    },
    {
      title: "Precio",
      dataIndex: "price",
      width: 120,
      render: (value: number) =>
        value != null
          ? new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(value)
          : "-",
    },
    {
      title: "Acciones",
      width: 280,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              type="default"
              icon={<EyeOutlined />}
              disabled
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id!)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setMedicineToDelete(record.id!)
                setOpenConfirm(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Cargar lote">
            <Button
              type="default"
              icon={<InboxOutlined />}
              disabled
            />
          </Tooltip>
          <Tooltip title="Editar lote">
            <Button
              type="default"
              icon={<FormOutlined />}
              disabled
            />
          </Tooltip>
          <Tooltip title="Agregar a hoja de hospitalización">
            <Button
              type="default"
              icon={<MedicineBoxOutlined />}
              disabled
            />
          </Tooltip>
          <Tooltip title="Agregar a hoja de cirugía">
            <Button
              type="default"
              icon={<ScissorOutlined />}
              disabled
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleDelete = () => {
    if (!medicineToDelete || deleteMedicine.isPending) return
    deleteMedicine.mutate(medicineToDelete, {
      onSuccess: () => {
        toast.success("Medicamento eliminado correctamente")
        setOpenConfirm(false)
        setMedicineToDelete(null)
      },
      onError: () => {
        toast.error("Error eliminando medicamento")
        setOpenConfirm(false)
      },
    })
  }

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar medicamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
        />
      </div>

      <Table<TMedicine>
        size="small"
        columns={columns}
        dataSource={filteredMedicines}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando información..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false)
          setMedicineToDelete(null)
        }}
        title="Eliminar medicamento"
        subtitle="¿Estás seguro de eliminar este medicamento?"
        loading={deleteMedicine.isPending}
        onConfirm={handleDelete}
      />
    </Container>
  )
}

export default MedicineTable
