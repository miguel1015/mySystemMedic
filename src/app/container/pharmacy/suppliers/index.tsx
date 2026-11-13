"use client"

import { useState } from "react"
import { Button, Form, Input, Switch, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { DeleteOutlined, PlusOutlined, ShopOutlined, StopOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import DataTable from "@/components/dataTable/DataTable"
import PageHeader from "@/components/dataTable/PageHeader"
import { RowActions } from "@/components/dataTable/cells"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import { useDeleteSupplier, useSaveSupplier, useSuppliers } from "@/core/hooks/pharmacy/usePharmacy"
import type { Supplier, SupplierRequest } from "@/core/interfaces/pharmacy/types"
import { formatInstitutionName } from "@/core/utils/displayText"
import { PopupLayer } from "../shared/components"
import styles from "../shared/pharmacy.module.scss"

const toRequest = (s: Supplier, patch: Partial<SupplierRequest> = {}): SupplierRequest => ({
  nit: s.nit,
  verificationDigit: s.verificationDigit,
  name: s.name,
  contactName: s.contactName,
  phone: s.phone,
  email: s.email,
  address: s.address,
  isActive: s.isActive,
  ...patch,
})

const fmtNit = (s: Pick<Supplier, "nit" | "verificationDigit">) =>
  `${/^\d+$/.test(s.nit) ? Number(s.nit).toLocaleString("es-CO") : s.nit}${s.verificationDigit ? `-${s.verificationDigit}` : ""}`

function SupplierForm({ supplier, onDone }: { supplier: Supplier | null; onDone: () => void }) {
  const save = useSaveSupplier()

  const submit = (values: SupplierRequest) =>
    save.mutate(
      { id: supplier?.id, data: values },
      {
        onSuccess: () => {
          toast.success(supplier ? "Proveedor actualizado" : "Proveedor creado")
          onDone()
        },
        onError: (e: Error) => toast.error(e.message),
      },
    )

  return (
    <Form<SupplierRequest>
      layout="vertical"
      onFinish={submit}
      initialValues={supplier ? toRequest(supplier) : { isActive: true }}
    >
      <div className={styles.grid}>
        <Form.Item label="NIT" required style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item
              name="nit"
              noStyle
              rules={[
                { required: true, whitespace: true, message: "Ingrese el NIT" },
                { pattern: /^[0-9.\s-]+$/, message: "Solo números" },
              ]}
            >
              <Input placeholder="900123456" inputMode="numeric" autoComplete="off" />
            </Form.Item>
            <Form.Item name="verificationDigit" noStyle rules={[{ pattern: /^\d?$/, message: "Un dígito" }]}>
              <Input placeholder="DV" maxLength={1} style={{ width: 56 }} aria-label="Dígito de verificación" />
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item
          name="name"
          label="Razón social"
          rules={[
            { required: true, whitespace: true, message: "Ingrese la razón social" },
            { max: 250, message: "Máximo 250 caracteres" },
          ]}
        >
          <Input placeholder="Distribuidora Médica S.A.S." />
        </Form.Item>
        <Form.Item name="contactName" label="Contacto" rules={[{ max: 150 }]}>
          <Input placeholder="Nombre de quien atiende" />
        </Form.Item>
        <Form.Item name="phone" label="Teléfono" rules={[{ max: 50 }]}>
          <Input placeholder="601 555 1234" inputMode="tel" />
        </Form.Item>
        <Form.Item name="email" label="Correo" rules={[{ type: "email", message: "Correo no válido" }, { max: 150 }]}>
          <Input placeholder="ventas@proveedor.com" inputMode="email" />
        </Form.Item>
        <Form.Item name="address" label="Dirección" rules={[{ max: 300 }]}>
          <Input placeholder="Calle 10 # 20-30, Bogotá" />
        </Form.Item>
        <Form.Item name="isActive" label="Estado" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-2">
        <Button onClick={onDone} disabled={save.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={save.isPending}>
          {supplier ? "Guardar cambios" : "Crear proveedor"}
        </Button>
      </div>
    </Form>
  )
}

export default function SuppliersContainer() {
  const { data = [], isLoading, isError, refetch } = useSuppliers(true)
  const save = useSaveSupplier()
  const remove = useDeleteSupplier()
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Supplier | null>(null)

  const openForm = (s: Supplier | null) => {
    setEditing(s)
    setOpen(true)
  }

  const columns: ColumnsType<Supplier> = [
    {
      title: "Proveedor",
      key: "name",
      render: (_, s) => (
        <span className={styles.product}>
          <span className={styles.productName}>{formatInstitutionName(s.name)}</span>
          <span className={`${styles.sub} ${styles.mono}`}>NIT {fmtNit(s)}</span>
        </span>
      ),
    },
    { title: "Contacto", key: "contact", render: (_, s) => s.contactName ?? "—" },
    { title: "Teléfono", key: "phone", render: (_, s) => s.phone ?? "—" },
    { title: "Correo", key: "email", render: (_, s) => (s.email ? <span className="keep-case">{s.email}</span> : "—") },
    {
      title: "Estado",
      key: "status",
      render: (_, s) => <Tag color={s.isActive ? "green" : "default"}>{s.isActive ? "Activo" : "Inactivo"}</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, s) => (
        <RowActions
          subject={s.name}
          onEdit={() => openForm(s)}
          items={[
            {
              key: "toggle",
              label: s.isActive ? "Inactivar" : "Activar",
              icon: <StopOutlined />,
              onClick: () =>
                save.mutate(
                  { id: s.id, data: toRequest(s, { isActive: !s.isActive }) },
                  {
                    onSuccess: () => toast.success(s.isActive ? "Proveedor inactivado" : "Proveedor activado"),
                    onError: (e: Error) => toast.error(e.message),
                  },
                ),
            },
            ...(s.canDelete
              ? [
                  {
                    key: "delete",
                    label: "Eliminar",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => setToDelete(s),
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
          icon={<ShopOutlined />}
          title="Proveedores"
          subtitle={isLoading ? "Cargando proveedores…" : `${data.length} proveedores de medicamentos e insumos`}
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
              Nuevo proveedor
            </Button>
          }
        />

        <DataTable<Supplier>
          data={data}
          columns={columns}
          rowKey="id"
          entity={["proveedor", "proveedores"]}
          syncUrl
          loading={isLoading}
          error={isError}
          onRetry={() => refetch()}
          searchPlaceholder="Buscar por razón social, NIT o contacto…"
          searchText={(s) => `${s.name} ${s.nit} ${s.contactName ?? ""} ${s.email ?? ""}`}
          quickFilters={[
            { key: "status", placeholder: "Estado", getValue: (s) => (s.isActive ? "Activo" : "Inactivo") },
          ]}
          onRowClick={(s) => openForm(s)}
          emptyAction={{ label: "Registrar el primer proveedor", onClick: () => openForm(null) }}
        />

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          title={editing ? "Editar proveedor" : "Nuevo proveedor"}
        >
          {open && <SupplierForm key={editing?.id ?? "new"} supplier={editing} onDone={() => setOpen(false)} />}
        </Modal>

        <ModalConfirm
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          title="Eliminar proveedor"
          subtitle={`¿Eliminar a ${toDelete?.name ?? ""}? No tiene entradas registradas.`}
          loading={remove.isPending}
          onConfirm={() =>
            toDelete &&
            remove.mutate(toDelete.id, {
              onSuccess: () => {
                toast.success("Proveedor eliminado")
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
