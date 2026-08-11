"use client"

import Modal from "@/components/modal"
import { PlusOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Empty, Input, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { formatCurrency } from "../utils"

export interface PickerRow {
  id: number
  code: string
  name: string
  value: number
}

interface ItemPickerModalProps {
  open: boolean
  title: string
  loading: boolean
  items: PickerRow[]
  onClose: () => void
  onSelect: (item: PickerRow) => void
}

const ItemPickerModal = ({
  open,
  title,
  loading,
  items,
  onClose,
  onSelect,
}: ItemPickerModalProps) => {
  const [search, setSearch] = useState("")

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term),
    )
  }, [items, search])

  const columns: ColumnsType<PickerRow> = [
    { title: "Código", dataIndex: "code", width: 130 },
    { title: "Nombre", dataIndex: "name" },
    {
      title: "Valor",
      dataIndex: "value",
      width: 140,
      align: "right",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "",
      key: "action",
      width: 110,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onSelect(record)}
        >
          Agregar
        </Button>
      ),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <Input
        placeholder="Buscar por código o nombre..."
        prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 14 }}
      />
      <Table<PickerRow>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={filteredItems}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 520 }}
        locale={{ emptyText: <Empty description="Sin resultados" /> }}
      />
    </Modal>
  )
}

export default ItemPickerModal
