"use client"

import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import tableStyles from "@/components/dataTable/dataTable.module.scss"
import { useUrlState } from "@/core/hooks/utils/useUrlState"
import {
  useCupsHomologation,
  useUpdateCupsHomologation,
} from "@/core/hooks/parameterization/cups/useCups"
import type {
  CupsHomologationItem,
  CupsHomologationStatus,
} from "@/core/interfaces/parameterization/cups"
import {
  CheckCircleOutlined,
  NodeIndexOutlined,
  SaveOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import CupsPicker, { CupsOption } from "./cupsPicker"

const STATUS_OPTIONS: { label: string; value: CupsHomologationStatus }[] = [
  { label: "Pendientes", value: "pending" },
  { label: "Homologados", value: "done" },
  { label: "Todos", value: "all" },
]

// Homologación de los códigos del manual tarifario (SOAT) al CUPS que exige el RIPS. Se
// asigna por código: aplica a todos los tarifarios que lo usan. Los más facturados primero.
export default function CupsHomologationContainer() {
  const [messageApi, contextHolder] = message.useMessage()
  // Estado, búsqueda y página quedan en la URL: al volver se sigue donde se iba.
  const [url, setUrl] = useUrlState({ estado: "pending", buscar: "", pagina: "1", tamano: "20" })
  const status: CupsHomologationStatus = STATUS_OPTIONS.some((o) => o.value === url.estado)
    ? (url.estado as CupsHomologationStatus)
    : "pending"
  const search = url.buscar ?? ""
  const page = Math.max(1, Number(url.pagina) || 1)
  const pageSize = [10, 20, 50].includes(Number(url.tamano)) ? Number(url.tamano) : 20
  const [searchInput, setSearchInput] = useState("")
  // Selección en curso por código del tarifario (aún sin guardar).
  const [drafts, setDrafts] = useState<Record<number, CupsOption | null>>({})
  // Filas homologadas que se están cambiando.
  const [editing, setEditing] = useState<Record<number, boolean>>({})

  // El cuadro de búsqueda se llena con lo que traiga la URL.
  useEffect(() => setSearchInput(search), [search])

  useEffect(() => {
    const term = searchInput.trim()
    if (term === search) return
    const timer = setTimeout(() => setUrl({ buscar: term, pagina: "1" }), 350)
    return () => clearTimeout(timer)
  }, [searchInput, search, setUrl])

  const { data, isLoading, isFetching } = useCupsHomologation(status, search, page, pageSize)
  const update = useUpdateCupsHomologation()

  const save = (item: CupsHomologationItem) => {
    const selected = drafts[item.referenceCode]
    if (!selected) return
    update.mutate(
      { referenceCode: item.referenceCode, cupsCode: selected.code },
      {
        onSuccess: (res) => {
          messageApi.success(
            `CUPS ${res.cupsCode} asignado al código ${res.referenceCode} (${res.updatedTariffDetails} detalle${
              res.updatedTariffDetails === 1 ? "" : "s"
            } de tarifa).`,
          )
          setDrafts((prev) => {
            const next = { ...prev }
            delete next[item.referenceCode]
            return next
          })
          setEditing((prev) => ({ ...prev, [item.referenceCode]: false }))
        },
        onError: (error) => messageApi.error(error.message),
      },
    )
  }

  const columns: ColumnsType<CupsHomologationItem> = [
    {
      title: "Código tarifario",
      dataIndex: "referenceCode",
      width: 120,
      render: (value: number) => <span style={{ fontFamily: "monospace" }}>{value}</span>,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      width: 280,
      render: (value: string, record) => (
        <div>
          <div>{value}</div>
          {record.tariffDetailCount > 1 && (
            <small style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
              En {record.tariffDetailCount} tarifarios
            </small>
          )}
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Veces que se ha cargado en admisiones (servicios y cirugías)">Facturado</Tooltip>
      ),
      dataIndex: "billedCount",
      width: 100,
      align: "center",
      render: (value: number) =>
        value > 0 ? <Tag color="blue">{value}</Tag> : <span style={{ color: "#9ca3af" }}>0</span>,
    },
    {
      title: "CUPS",
      key: "cups",
      render: (_, record) => {
        const isEditing = !record.cupsCode || editing[record.referenceCode]
        if (!isEditing) {
          return (
            <Space orientation="vertical" size={2}>
              <Space size={6}>
                <CheckCircleOutlined style={{ color: "#16a34a" }} />
                <strong style={{ fontFamily: "monospace" }}>{record.cupsCode}</strong>
                {record.hasConflictingCups && (
                  <Tooltip title="Los tarifarios de este código tienen CUPS distintos; al guardar se unifican.">
                    <Tag color="warning">CUPS distintos</Tag>
                  </Tooltip>
                )}
              </Space>
              <small>{record.cupsName}</small>
            </Space>
          )
        }

        return (
          <CupsPicker
            description={record.description}
            suggestions={record.cupsCode ? undefined : record.suggestions}
            value={
              drafts[record.referenceCode] ??
              (record.cupsCode ? { code: record.cupsCode, name: record.cupsName ?? "" } : null)
            }
            onChange={(value) => setDrafts((prev) => ({ ...prev, [record.referenceCode]: value }))}
          />
        )
      },
    },
    {
      title: "",
      key: "actions",
      width: 130,
      align: "right",
      render: (_, record) => {
        const isEditing = !record.cupsCode || editing[record.referenceCode]
        if (!isEditing) {
          return (
            <Button
              icon={<SwapOutlined />}
              onClick={() => setEditing((prev) => ({ ...prev, [record.referenceCode]: true }))}
            >
              Cambiar
            </Button>
          )
        }
        const draft = drafts[record.referenceCode]
        return (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!draft || draft.code === record.cupsCode}
            loading={update.isPending && update.variables?.referenceCode === record.referenceCode}
            onClick={() => save(record)}
          >
            Guardar
          </Button>
        )
      },
    },
  ]

  const summary = data?.summary

  return (
    <Container>
      {contextHolder}
      <PageHeader
        icon={<NodeIndexOutlined />}
        title="Homologación CUPS"
        subtitle="Asigne a cada código del manual tarifario su CUPS, que es el que se reporta en el RIPS. Aplica a todos los tarifarios que usan ese código; revise siempre las sugerencias antes de guardar."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Códigos del tarifario" value={summary?.totalCodes ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Homologados"
              value={summary?.homologatedCodes ?? 0}
              suffix={
                summary && summary.totalCodes > 0
                  ? `(${Math.round((summary.homologatedCodes / summary.totalCodes) * 100)} %)`
                  : undefined
              }
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Pendientes" value={summary?.pendingCodes ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Facturados sin CUPS"
              value={summary?.pendingBilledCodes ?? 0}
              valueStyle={summary?.pendingBilledCodes ? { color: "#d97706" } : undefined}
            />
          </Card>
        </Col>
      </Row>

      {!!summary?.pendingBilledCodes && status === "pending" && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="Empiece por los primeros de la lista"
          description="Están ordenados por la cantidad de veces que se han facturado: son los que hoy salen sin CUPS en el RIPS."
        />
      )}

      <div className={tableStyles.toolbar} style={{ marginBottom: 14 }}>
        <Segmented
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => setUrl({ estado: String(value), pagina: "1" })}
        />
        <Input
          className={tableStyles.search}
          allowClear
          prefix={<SearchOutlined aria-hidden />}
          placeholder="Buscar por código, descripción o CUPS…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar códigos"
        />
      </div>

      <Table<CupsHomologationItem>
        className={tableStyles.table}
        size="middle"
        rowKey="referenceCode"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        scroll={{ x: "max-content" }}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          locale: { items_per_page: "/ página" },
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} de ${total.toLocaleString("es-CO")} códigos`,
          onChange: (nextPage, nextSize) =>
            setUrl({ pagina: String(nextSize !== pageSize ? 1 : nextPage), tamano: String(nextSize) }),
        }}
        locale={{
          emptyText: search
            ? `Ningún código coincide con “${search}”.`
            : status === "pending"
              ? "No hay códigos pendientes de homologar."
              : "Sin resultados.",
        }}
      />
    </Container>
  )
}
