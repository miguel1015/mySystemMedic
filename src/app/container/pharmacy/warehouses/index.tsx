"use client"

import { useState } from "react"
import { Button, Form, Input, Radio, Select, Switch, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { CloudOutlined, DeleteOutlined, HomeOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import DataTable from "@/components/dataTable/DataTable"
import PageHeader from "@/components/dataTable/PageHeader"
import { RowActions } from "@/components/dataTable/cells"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import {
  useDeleteWarehouse,
  usePharmacyUsers,
  useSaveWarehouse,
  useWarehouses,
} from "@/core/hooks/pharmacy/usePharmacy"
import type { Warehouse, WarehouseRequest } from "@/core/interfaces/pharmacy/types"
import { formatPersonName } from "@/core/utils/displayText"
import { fmtQty } from "../shared/format"
import { PopupLayer } from "../shared/components"
import styles from "../shared/pharmacy.module.scss"

const toRequest = (w: Warehouse, patch: Partial<WarehouseRequest> = {}): WarehouseRequest => ({
  code: w.code,
  name: w.name,
  description: w.description,
  location: w.location,
  responsibleUserId: w.responsibleUserId,
  isVirtual: w.isVirtual,
  isActive: w.isActive,
  ...patch,
})

function WarehouseForm({ warehouse, onDone }: { warehouse: Warehouse | null; onDone: () => void }) {
  const [form] = Form.useForm<WarehouseRequest>()
  const save = useSaveWarehouse()
  const { data: users = [], isLoading: loadingUsers } = usePharmacyUsers()
  const hasStock = !!warehouse && warehouse.totalQuantity > 0

  const submit = (values: WarehouseRequest) => {
    save.mutate(
      { id: warehouse?.id, data: { ...values, responsibleUserId: values.responsibleUserId ?? null } },
      {
        onSuccess: () => {
          toast.success(warehouse ? "Bodega actualizada" : "Bodega creada")
          onDone()
        },
        onError: (e: Error) => toast.error(e.message),
      },
    )
  }

  return (
    <Form<WarehouseRequest>
      form={form}
      layout="vertical"
      requiredMark
      onFinish={submit}
      initialValues={
        warehouse
          ? toRequest(warehouse)
          : { code: "", name: "", isVirtual: false, isActive: true, responsibleUserId: undefined }
      }
    >
      <div className={styles.grid}>
        <Form.Item
          name="code"
          label="Código"
          rules={[
            { required: true, whitespace: true, message: "Ingrese el código" },
            { max: 20, message: "Máximo 20 caracteres" },
          ]}
          normalize={(v: string) => v?.toUpperCase()}
        >
          <Input placeholder="BOD-01" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Nombre"
          rules={[
            { required: true, whitespace: true, message: "Ingrese el nombre" },
            { max: 150, message: "Máximo 150 caracteres" },
          ]}
        >
          <Input placeholder="Farmacia principal" />
        </Form.Item>
        <Form.Item name="location" label="Ubicación" rules={[{ max: 250, message: "Máximo 250 caracteres" }]}>
          <Input placeholder="Piso 1, junto a urgencias" />
        </Form.Item>
        <Form.Item name="responsibleUserId" label="Responsable">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            loading={loadingUsers}
            placeholder="Seleccione el responsable"
            options={users.map((u) => ({
              value: u.id,
              label: `${formatPersonName(u.name)}${u.documentNumber ? ` · ${u.documentNumber}` : ""}`,
            }))}
          />
        </Form.Item>
      </div>
      <Form.Item name="description" label="Descripción" rules={[{ max: 500, message: "Máximo 500 caracteres" }]}>
        <Input.TextArea rows={2} placeholder="Para qué se usa esta bodega" />
      </Form.Item>
      <div className={styles.grid}>
        <Form.Item
          name="isVirtual"
          label="Tipo de bodega"
          extra={
            hasStock
              ? "No se puede cambiar el tipo mientras la bodega tenga existencias."
              : "La virtual maneja existencias y movimientos igual que una física (p. ej. en tránsito o consignación)."
          }
        >
          <Radio.Group
            disabled={hasStock}
            optionType="button"
            options={[
              { value: false, label: "Física" },
              { value: true, label: "Virtual" },
            ]}
          />
        </Form.Item>
        <Form.Item name="isActive" label="Estado" valuePropName="checked">
          <Switch checkedChildren="Activa" unCheckedChildren="Inactiva" />
        </Form.Item>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <Button onClick={onDone} disabled={save.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={save.isPending}>
          {warehouse ? "Guardar cambios" : "Crear bodega"}
        </Button>
      </div>
    </Form>
  )
}

export default function WarehousesContainer() {
  const { data = [], isLoading, isError, refetch } = useWarehouses(true)
  const save = useSaveWarehouse()
  const remove = useDeleteWarehouse()
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Warehouse | null>(null)

  const active = data.filter((w) => w.isActive).length
  const openForm = (w: Warehouse | null) => {
    setEditing(w)
    setOpen(true)
  }

  const toggleActive = (w: Warehouse) =>
    save.mutate(
      { id: w.id, data: toRequest(w, { isActive: !w.isActive }) },
      {
        onSuccess: () => toast.success(w.isActive ? "Bodega inactivada" : "Bodega activada"),
        onError: (e: Error) => toast.error(e.message),
      },
    )

  const columns: ColumnsType<Warehouse> = [
    {
      title: "Bodega",
      key: "name",
      render: (_, w) => (
        <span className={styles.product}>
          <span className={styles.productName}>
            {w.isVirtual ? <CloudOutlined aria-hidden /> : <HomeOutlined aria-hidden />} {w.name}
          </span>
          <span className={`${styles.sub} ${styles.mono}`}>{w.code}</span>
        </span>
      ),
    },
    {
      title: "Tipo",
      key: "type",
      render: (_, w) => <Tag color={w.isVirtual ? "purple" : "blue"}>{w.isVirtual ? "Virtual" : "Física"}</Tag>,
    },
    { title: "Ubicación", key: "location", render: (_, w) => w.location ?? "—" },
    {
      title: "Responsable",
      key: "responsible",
      render: (_, w) => (w.responsibleUserName ? formatPersonName(w.responsibleUserName) : "—"),
    },
    {
      title: "Lotes con existencia",
      key: "lots",
      align: "right",
      render: (_, w) => <span className={styles.qty}>{w.lotsWithStock.toLocaleString("es-CO")}</span>,
    },
    {
      title: "Unidades",
      key: "units",
      align: "right",
      render: (_, w) => <span className={styles.qty}>{fmtQty(w.totalQuantity)}</span>,
    },
    {
      title: "Estado",
      key: "status",
      render: (_, w) => <Tag color={w.isActive ? "green" : "default"}>{w.isActive ? "Activa" : "Inactiva"}</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, w) => (
        <RowActions
          subject={w.name}
          onEdit={() => openForm(w)}
          items={[
            {
              key: "toggle",
              label: w.isActive ? "Inactivar" : "Activar",
              icon: <StopOutlined />,
              onClick: () => toggleActive(w),
            },
            ...(w.canDelete
              ? [
                  {
                    key: "delete",
                    label: "Eliminar",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => setToDelete(w),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ]

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<HomeOutlined />}
          title="Bodegas"
          subtitle={
            isLoading
              ? "Cargando bodegas…"
              : `${active} ${active === 1 ? "bodega activa" : "bodegas activas"} de ${data.length}`
          }
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
              Nueva bodega
            </Button>
          }
        />

        <DataTable<Warehouse>
          data={data}
          columns={columns}
          rowKey="id"
          entity={["bodega", "bodegas"]}
          feminine
          syncUrl
          loading={isLoading}
          error={isError}
          onRetry={() => refetch()}
          searchPlaceholder="Buscar por nombre, código o ubicación…"
          searchText={(w) => `${w.name} ${w.code} ${w.location ?? ""} ${w.responsibleUserName ?? ""}`}
          quickFilters={[
            { key: "type", placeholder: "Tipo", getValue: (w) => (w.isVirtual ? "Virtual" : "Física") },
            { key: "status", placeholder: "Estado", getValue: (w) => (w.isActive ? "Activa" : "Inactiva") },
          ]}
          onRowClick={(w) => openForm(w)}
          emptyAction={{ label: "Crear la primera bodega", onClick: () => openForm(null) }}
        />

        <Modal open={open} onClose={() => setOpen(false)} size="lg" title={editing ? "Editar bodega" : "Nueva bodega"}>
          {open && <WarehouseForm key={editing?.id ?? "new"} warehouse={editing} onDone={() => setOpen(false)} />}
        </Modal>

        <ModalConfirm
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          title="Eliminar bodega"
          subtitle={`¿Eliminar la bodega ${toDelete?.name ?? ""}? No tiene existencias ni movimientos, así que se puede borrar.`}
          loading={remove.isPending}
          onConfirm={() =>
            toDelete &&
            remove.mutate(toDelete.id, {
              onSuccess: () => {
                toast.success("Bodega eliminada")
                setToDelete(null)
              },
              onError: (e: Error) => {
                toast.error(e.message)
                setToDelete(null)
              },
            })
          }
        />
      </Container>
    </PopupLayer>
  )
}
