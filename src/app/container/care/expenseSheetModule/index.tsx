"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Button,
  Descriptions,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type ExpenseSheetContext = "urgency" | "hospitalization" | "surgery"

interface ExpenseSheetModuleProps {
  title: string;
  description: string;
  context: ExpenseSheetContext;
}

interface ExpenseItem {
  key: string;
  code: string;
  description: string;
  quantity: number;
  serviceType: string;
}

const careAssistants = [
  "NESKER SMITH MARTINEZ PEREZ - MEDICINA GENERAL",
  "LAURA VALENTINA GOMEZ RUIZ - ENFERMERIA JEFE",
  "CARLOS ANDRES MORALES DIAZ - CIRUGIA GENERAL",
]

const serviceOptionsByContext: Record<ExpenseSheetContext, { label: string; value: string }[]> = {
  urgency: [
    { label: "Medicamentos", value: "medications" },
    { label: "Insumos", value: "supplies" },
    { label: "Procedimientos", value: "procedures" },
  ],
  hospitalization: [
    { label: "Medicamentos", value: "medications" },
    { label: "Insumos de estancia", value: "supplies" },
    { label: "Apoyo terapeutico", value: "procedures" },
  ],
  surgery: [
    { label: "Medicamentos", value: "medications" },
    { label: "Insumos quirurgicos", value: "supplies" },
    { label: "Material esteril", value: "sterile" },
  ],
}

const initialItemsByContext: Record<ExpenseSheetContext, ExpenseItem[]> = {
  urgency: [
    {
      key: "urg-med-1",
      code: "17030",
      description: "LACTATO DE RINGER 500ML / SOLUCION INYECTABLE",
      quantity: 2,
      serviceType: "medications",
    },
    {
      key: "urg-med-2",
      code: "16996",
      description: "DIPIRONA 1G/2ML AMP / ANALGESICO INYECTABLE",
      quantity: 3,
      serviceType: "medications",
    },
    {
      key: "urg-sup-1",
      code: "3094",
      description: "ABOCATH #18",
      quantity: 1,
      serviceType: "supplies",
    },
    {
      key: "urg-pro-1",
      code: "9071",
      description: "CURACION SIMPLE EN SALA DE URGENCIAS",
      quantity: 1,
      serviceType: "procedures",
    },
  ],
  hospitalization: [
    {
      key: "hos-med-1",
      code: "16968",
      description: "CEFAZOLINA 1 GR AMP / ANTIBIOTICO",
      quantity: 3,
      serviceType: "medications",
    },
    {
      key: "hos-med-2",
      code: "16909",
      description: "DEXAMETASONA 4MG/1ML SOLUCION INYECTABLE",
      quantity: 9,
      serviceType: "medications",
    },
    {
      key: "hos-sup-1",
      code: "4061",
      description: "EQUIPO MACROGOTEO",
      quantity: 2,
      serviceType: "supplies",
    },
    {
      key: "hos-pro-1",
      code: "8805",
      description: "TERAPIA RESPIRATORIA INTRAHOSPITALARIA",
      quantity: 1,
      serviceType: "procedures",
    },
  ],
  surgery: [
    {
      key: "sur-med-1",
      code: "17096",
      description: "SOLUCION SALINA 0.9% 100ML / USO QUIRURGICO",
      quantity: 3,
      serviceType: "medications",
    },
    {
      key: "sur-med-2",
      code: "16968",
      description: "CEFAZOLINA 1 GR AMP / PROFILAXIS ANTIBIOTICA",
      quantity: 1,
      serviceType: "medications",
    },
    {
      key: "sur-sup-1",
      code: "7302",
      description: "GUANTES QUIRURGICOS ESTERILES PAR",
      quantity: 4,
      serviceType: "supplies",
    },
    {
      key: "sur-sterile-1",
      code: "8124",
      description: "PAQUETE DE CAMPOS ESTERILES PARA CIRUGIA",
      quantity: 1,
      serviceType: "sterile",
    },
  ],
}

const medicalOrderItems: ExpenseItem[] = [
  {
    key: "order-1",
    code: "16909",
    description: "DEXAMETASONA 4MG/1ML SOLUCION INYECTABLE",
    quantity: 1,
    serviceType: "medications",
  },
  {
    key: "order-2",
    code: "3094",
    description: "ABOCATH #18",
    quantity: 1,
    serviceType: "supplies",
  },
  {
    key: "order-3",
    code: "8124",
    description: "PAQUETE DE CAMPOS ESTERILES PARA CIRUGIA",
    quantity: 1,
    serviceType: "sterile",
  },
]

const formatAdmissionDate = (value: string | null) => {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDateTimeLocal = (value: string) => {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ExpenseSheetModule = ({ title, description, context }: ExpenseSheetModuleProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()

  const admissionId = searchParams.get("admissionId")
  const patientId = searchParams.get("patientId")
  const patientName = searchParams.get("patientName")
  const documentNumber = searchParams.get("documentNumber")
  const careScope = searchParams.get("careScope")
  const admissionDate = searchParams.get("admissionDate")

  const serviceOptions = serviceOptionsByContext[context]
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16))
  const [assistant, setAssistant] = useState(careAssistants[0])
  const [serviceType, setServiceType] = useState(serviceOptions[0].value)
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<ExpenseItem[]>(initialItemsByContext[context])
  const [ordersOpen, setOrdersOpen] = useState(false)

  const hasPatientContext = Boolean(admissionId && patientId && patientName)

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return items.filter((item) => {
      const matchesService = item.serviceType === serviceType
      const matchesSearch =
        !normalizedSearch ||
        item.code.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch)

      return matchesService && matchesSearch
    })
  }, [items, search, serviceType])

  const selectedServiceLabel = serviceOptions.find((option) => option.value === serviceType)?.label || "Servicio"
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)

  const getServiceLabel = (value: string) =>
    serviceOptionsByContext[context].find((option) => option.value === value)?.label || value

  const updateQuantity = (key: string, quantity: number | null) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(Number(quantity || 1), 1) } : item
      )
    )
  }

  const deleteItem = (key: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== key))
    messageApi.success("Registro eliminado de la hoja.")
  }

  const linkMedicalOrder = (order: ExpenseItem) => {
    const orderKey = `${order.key}-${Date.now()}`

    setItems((currentItems) => {
      const exists = currentItems.find(
        (item) => item.code === order.code && item.serviceType === order.serviceType
      )

      if (exists) {
        return currentItems.map((item) =>
          item.key === exists.key ? { ...item, quantity: item.quantity + order.quantity } : item
        )
      }

      return [...currentItems, { ...order, key: orderKey }]
    })

    setServiceType(order.serviceType)
    messageApi.success("Orden medica vinculada a la hoja.")
  }

  const saveExpenses = () => {
    messageApi.success(`Gastos guardados: ${items.length} registros en la hoja.`)
  }

  const printExpenses = () => {
    messageApi.info("Preparando impresion de la hoja de gastos.")
    window.setTimeout(() => window.print(), 150)
  }

  const columns: ColumnsType<ExpenseItem> = [
    {
      title: "Codigo",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => <span style={{ fontWeight: 700 }}>{code}</span>,
    },
    {
      title: "Desc. general / comercial",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <span style={{ color: "var(--dash-text-primary, #111827)" }}>{description}</span>
      ),
    },
    {
      title: "Cant.",
      dataIndex: "quantity",
      key: "quantity",
      width: 160,
      render: (_quantity: number, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateQuantity(record.key, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar cantidad">
            <Button
              icon={<EditOutlined />}
              onClick={() => messageApi.info("Edita la cantidad directamente en la columna Cant.")}
            />
          </Tooltip>
          <Tooltip title="Eliminar registro">
            <Button danger icon={<DeleteOutlined />} onClick={() => deleteItem(record.key)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Container fluid padding="md">
      {contextHolder}

      <div className="expense-print-area expense-screen-only">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileTextOutlined style={{ fontSize: 24, color: "var(--theme-primary, #0F6F5C)" }} />
            <Title level={3}>{title}</Title>
          </div>

          <Space wrap className="expense-actions">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Volver
            </Button>
            <Button icon={<PrinterOutlined />} onClick={printExpenses}>
              Imprimir gastos
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveExpenses}>
              Guardar gastos
            </Button>
          </Space>
        </div>

        <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 18, marginTop: -8 }}>
          {description}
        </p>

        {hasPatientContext ? (
          <>
            <div
              style={{
                border: "1px solid var(--dash-border, #e5e7eb)",
                borderRadius: 8,
                background: "var(--dash-surface, #ffffff)",
                overflow: "hidden",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "16px 18px",
                  background: "rgba(var(--theme-primary-rgb, 15,111,92), 0.08)",
                  borderBottom: "1px solid var(--dash-border, #e5e7eb)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--dash-text-secondary, #6b7280)" }}>
                    Paciente seleccionado
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--dash-text-primary, #111827)" }}>
                    {patientName}
                  </div>
                </div>

                <Space wrap>
                  <Tag color="green">Admision {admissionId}</Tag>
                  <Tag>{documentNumber || "Sin documento"}</Tag>
                  <Tag>{careScope || "Sin ambito"}</Tag>
                </Space>
              </div>

              <Descriptions
                bordered
                column={{ xs: 1, sm: 1, md: 3, lg: 3 }}
                size="small"
                items={[
                  {
                    key: "patientId",
                    label: (
                      <span>
                        <UserOutlined /> Paciente ID
                      </span>
                    ),
                    children: patientId,
                  },
                  {
                    key: "admissionDate",
                    label: (
                      <span>
                        <CalendarOutlined /> Admision
                      </span>
                    ),
                    children: formatAdmissionDate(admissionDate),
                  },
                  {
                    key: "serviceSummary",
                    label: "Servicio activo",
                    children: selectedServiceLabel,
                  },
                ]}
              />
            </div>

            <div
              style={{
                border: "1px solid var(--dash-border, #e5e7eb)",
                borderRadius: 8,
                background: "var(--dash-surface, #ffffff)",
                padding: 18,
                marginBottom: 18,
              }}
            >
              <div
                className="expense-control-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 0.8fr) minmax(280px, 1.4fr) minmax(180px, 0.8fr)",
                  gap: 16,
                  alignItems: "end",
                }}
              >
                <label className="expense-control-field">
                  <span>Fecha y hora</span>
                  <Input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(event) => setDateTime(event.target.value)}
                    prefix={<CalendarOutlined />}
                  />
                </label>

                <label className="expense-control-field expense-control-field-signature">
                  <span>Asistencial que firma</span>
                  <Select
                    className="expense-control-select"
                    value={assistant}
                    onChange={setAssistant}
                    options={careAssistants.map((value) => ({ value, label: value }))}
                    popupMatchSelectWidth={false}
                  />
                </label>

                <label className="expense-control-field">
                  <span>Tipo de servicio</span>
                  <Select
                    className="expense-control-select"
                    value={serviceType}
                    onChange={setServiceType}
                    options={serviceOptions}
                    suffixIcon={<MedicineBoxOutlined />}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1fr) auto",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  prefix={<SearchOutlined />}
                  placeholder="Buscar por codigo, insumo o medicamento"
                  allowClear
                />
                <Button icon={<FileDoneOutlined />} onClick={() => setOrdersOpen(true)}>
                  Ordenes medicas
                </Button>
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--dash-border, #e5e7eb)",
                borderRadius: 8,
                background: "var(--dash-surface, #ffffff)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--dash-border, #e5e7eb)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>Registros asociados</div>
                  <div style={{ color: "var(--dash-text-secondary, #6b7280)", fontSize: 13 }}>
                    {filteredItems.length} registros para {selectedServiceLabel.toLowerCase()}
                  </div>
                </div>
                <Tag color="blue">Lista dinamica</Tag>
              </div>

              <Table
                rowKey="key"
                columns={columns}
                dataSource={filteredItems}
                pagination={false}
                scroll={{ x: 760 }}
                locale={{
                  emptyText: (
                    <Empty description="No hay registros para este servicio o busqueda." />
                  ),
                }}
              />
            </div>
          </>
        ) : (
          <Empty description="Selecciona un paciente desde Evolucionar HC para abrir esta hoja con contexto clinico.">
            <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
              Ir a Evolucionar HC
            </Button>
          </Empty>
        )}
      </div>

      {hasPatientContext && (
        <section className="expense-print-document" aria-hidden="true">
          <header className="expense-print-header">
            <div className="expense-print-logo" aria-label="Logo IPS">
              <span>DM</span>
              <small>DataMedic</small>
            </div>

            <div className="expense-print-entity">
              <strong>CLINICA FUNDACION IPS SAS</strong>
              <span>NIT: 900517542-5</span>
              <span>Direccion: Calle 10 Carrera 4-09</span>
              <span>Telefono: 3205626977</span>
            </div>

            <div className="expense-print-admission">
              <span>ADMISION</span>
              <strong>{admissionId}</strong>
            </div>
          </header>

          <div className="expense-print-meta">
            <div>
              <span>Fecha y hora</span>
              <strong>{formatDateTimeLocal(dateTime)}</strong>
            </div>
            <div>
              <span>Paciente</span>
              <strong>{patientName}</strong>
            </div>
            <div>
              <span>Documento</span>
              <strong>{documentNumber || "Sin documento"}</strong>
            </div>
            <div>
              <span>Ambito</span>
              <strong>{careScope || "Sin ambito"}</strong>
            </div>
            <div>
              <span>Admision</span>
              <strong>{formatAdmissionDate(admissionDate)}</strong>
            </div>
            <div>
              <span>Servicio activo</span>
              <strong>{selectedServiceLabel}</strong>
            </div>
          </div>

          <div className="expense-print-title-row">
            <div>
              <p>Hoja de gastos</p>
              <h1>{title}</h1>
            </div>
            <div className="expense-print-summary">
              <span>{items.length} registros</span>
              <strong>{totalQuantity}</strong>
              <small>cantidad total</small>
            </div>
          </div>

          <table className="expense-print-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Codigo</th>
                <th>Tipo</th>
                <th>Servicio</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.key}>
                  <td>{index + 1}</td>
                  <td>{item.code}</td>
                  <td>{getServiceLabel(item.serviceType)}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className="expense-print-footer">
            <div className="expense-print-signature">
              <strong>{assistant}</strong>
              <span>Asistencial que firma</span>
            </div>
            <div className="expense-print-signature">
              <strong>Area responsable: ENFERMERIA</strong>
              <span>Recepcion y validacion de gastos</span>
            </div>
          </footer>
        </section>
      )}

      <Modal
        title="Ordenes medicas disponibles"
        open={ordersOpen}
        onCancel={() => setOrdersOpen(false)}
        footer={<Button onClick={() => setOrdersOpen(false)}>Cerrar</Button>}
        width={760}
      >
        <Table
          rowKey="key"
          pagination={false}
          dataSource={medicalOrderItems}
          scroll={{ x: 620 }}
          columns={[
            { title: "Codigo", dataIndex: "code", key: "code", width: 110 },
            { title: "Descripcion", dataIndex: "description", key: "description" },
            {
              title: "Tipo",
              dataIndex: "serviceType",
              key: "serviceType",
              width: 140,
              render: (value: string) => (
                serviceOptionsByContext[context].find((option) => option.value === value)?.label || value
              ),
            },
            {
              title: "Accion",
              key: "action",
              width: 120,
              render: (_, record) => (
                <Button type="primary" size="small" onClick={() => linkMedicalOrder(record)}>
                  Vincular
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      <style jsx global>{`
        .expense-print-document {
          display: none;
        }

        .expense-control-grid {
          min-width: 0;
        }

        .expense-control-field {
          display: grid;
          gap: 8px;
          min-width: 0;
          padding: 12px;
          border: 1px solid var(--dash-border, #e5e7eb);
          border-radius: 8px;
          background: rgba(var(--theme-primary-rgb, 15,111,92), 0.03);
        }

        .expense-control-field > span {
          min-width: 0;
          color: var(--dash-text-primary, #111827);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
        }

        .expense-control-field-signature {
          background: rgba(var(--theme-primary-rgb, 15,111,92), 0.06);
          border-color: rgba(var(--theme-primary-rgb, 15,111,92), 0.24);
        }

        .expense-control-field .ant-input-affix-wrapper,
        .expense-control-field .ant-picker,
        .expense-control-field .ant-select,
        .expense-control-select {
          width: 100%;
          min-width: 0;
        }

        .expense-control-field .ant-select-selector {
          min-width: 0;
        }

        .expense-control-field .ant-select-selection-item {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 980px) {
          .expense-control-grid {
            grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) !important;
          }

          .expense-control-field-signature {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .expense-actions {
            width: 100%;
          }

          .expense-actions .ant-btn {
            flex: 1 1 100%;
          }

          .expense-print-area [style*="grid-template-columns: minmax(220px, 1fr) auto"] {
            grid-template-columns: 1fr !important;
          }

          .expense-control-grid {
            grid-template-columns: 1fr !important;
          }

          .expense-control-field-signature {
            grid-column: auto;
          }
        }

        @media print {
          @page {
            size: letter;
            margin: 12mm;
          }

          html,
          body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden;
          }

          .expense-print-document,
          .expense-print-document * {
            visibility: visible;
          }

          .expense-actions,
          .ant-layout-sider,
          .ant-layout-header,
          .ant-btn,
          .ant-tooltip,
          .expense-screen-only {
            display: none !important;
          }

          .expense-print-document {
            display: block;
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            padding: 0;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
          }

          .expense-print-header {
            display: grid;
            grid-template-columns: 150px 1fr 150px;
            border: 1.5px solid #1f2937;
            min-height: 92px;
            margin-bottom: 16px;
          }

          .expense-print-logo,
          .expense-print-entity,
          .expense-print-admission {
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 1.5px solid #1f2937;
          }

          .expense-print-admission {
            border-right: 0;
            flex-direction: column;
            gap: 4px;
          }

          .expense-print-admission span {
            font-size: 10px;
            letter-spacing: 0.4px;
          }

          .expense-print-admission strong {
            font-size: 18px;
          }

          .expense-print-logo {
            flex-direction: column;
            gap: 2px;
          }

          .expense-print-logo span {
            width: 72px;
            height: 42px;
            border: 2px solid #0f6f5c;
            color: #0f6f5c;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .expense-print-logo small {
            font-size: 9px;
            font-weight: 700;
            color: #374151;
          }

          .expense-print-entity {
            flex-direction: column;
            gap: 2px;
            text-align: center;
          }

          .expense-print-entity strong {
            font-size: 12px;
            letter-spacing: 0.2px;
          }

          .expense-print-meta {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 28px;
            row-gap: 6px;
            border-bottom: 1px solid #9ca3af;
            padding: 0 2px 14px;
            margin-bottom: 18px;
          }

          .expense-print-meta div {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 8px;
          }

          .expense-print-meta span {
            color: #374151;
          }

          .expense-print-title-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 10px;
          }

          .expense-print-title-row p {
            margin: 0 0 2px;
            color: #0f6f5c;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .expense-print-title-row h1 {
            margin: 0;
            font-size: 18px;
            line-height: 1.2;
          }

          .expense-print-summary {
            min-width: 118px;
            border: 1px solid #1f2937;
            padding: 8px 10px;
            text-align: center;
          }

          .expense-print-summary span,
          .expense-print-summary small {
            display: block;
            font-size: 9px;
            color: #374151;
            text-transform: uppercase;
          }

          .expense-print-summary strong {
            display: block;
            font-size: 20px;
            line-height: 1.1;
          }

          .expense-print-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 18px;
          }

          .expense-print-table th {
            background: #26384a !important;
            color: #ffffff !important;
            border: 1px solid #111827;
            padding: 7px 6px;
            text-align: center;
            font-size: 11px;
          }

          .expense-print-table td {
            border: 1px solid #111827;
            padding: 6px;
            vertical-align: top;
            line-height: 1.25;
            word-break: break-word;
          }

          .expense-print-table th:nth-child(1),
          .expense-print-table td:nth-child(1) {
            width: 44px;
            text-align: center;
          }

          .expense-print-table th:nth-child(2),
          .expense-print-table td:nth-child(2) {
            width: 76px;
            text-align: center;
          }

          .expense-print-table th:nth-child(3),
          .expense-print-table td:nth-child(3) {
            width: 125px;
          }

          .expense-print-table th:nth-child(5),
          .expense-print-table td:nth-child(5) {
            width: 76px;
            text-align: center;
            font-weight: 700;
          }

          .expense-print-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            break-inside: avoid;
          }

          .expense-print-signature {
            min-height: 64px;
            border: 1px solid #111827;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 9px;
          }

          .expense-print-signature strong {
            border-top: 1px solid #111827;
            padding-top: 7px;
            font-size: 10px;
          }

          .expense-print-signature span {
            margin-top: 3px;
            color: #374151;
            font-size: 9px;
          }
        }
      `}</style>
    </Container>
  )
}

export default ExpenseSheetModule
