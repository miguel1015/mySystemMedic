"use client"

import { Container } from "@/components/container"
import { Button, Input, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { useContracts } from "../../../../core/hooks/parameterization/contracts/useGetAllContracts"
import { TContract } from "../../../../core/interfaces/parameterization/types"

interface ContractsTableProps {
  onEdit: (id: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  activo: "green",
  suspendido: "orange",
  terminado: "red",
}

const ContractsTable = ({ onEdit }: ContractsTableProps) => {
  const { data: dataContracts = [], isLoading } = useContracts()

  const [search, setSearch] = useState("")

  const filteredContracts = useMemo<TContract[]>(() => {
    const term = search.toLowerCase()

    return dataContracts.filter(
      (contract) =>
        contract.contractName?.toLowerCase().includes(term) ||
        contract.contractNumber?.toLowerCase().includes(term) ||
        String(contract.id).includes(term),
    )
  }, [search, dataContracts])

  const columns: ColumnsType<TContract> = [
    {
      title: "#",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Nombre del contrato",
      dataIndex: "contractName",
      width: 250,
    },
    {
      title: "Fecha de inicio",
      dataIndex: "startDate",
      width: 150,
    },
    {
      title: "Fecha final",
      dataIndex: "endDate",
      width: 150,
      render: (value: string | null) => value ?? "—",
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: 130,
      render: (value: string) => (
        <Tag color={STATUS_COLORS[value] ?? "default"}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "—"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id)}>
            Ver / Editar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar contrato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
        />
      </div>

      <Table<TContract>
        size="small"
        columns={columns}
        dataSource={filteredContracts}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando contratos..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </Container>
  )
}

export default ContractsTable
