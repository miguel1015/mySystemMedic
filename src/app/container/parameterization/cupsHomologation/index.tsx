"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import {
  useCupsHomologation,
  useUpdateCupsHomologation,
} from "@/core/hooks/parameterization/cups/useCups"
import type {
  CupsHomologationItem,
  CupsHomologationStatus,
} from "@/core/interfaces/parameterization/cups"
import { CheckCircleOutlined, SaveOutlined, SearchOutlined, SwapOutlined } from "@ant-design/icons"
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
  const [status, setStatus] = useState<CupsHomologationStatus>("pending")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  // Selección en curso por código del tarifario (aún sin guardar).
  const [drafts, setDrafts] = useState<Record<number, CupsOption | null>>({})
  // Filas homologadas que se están cambiando.
  const [editing, setEditing] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

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
      <Title level={3}>Homologación CUPS</Title>
      <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginTop: -8 }}>
        Asigne a cada código del manual tarifario su código CUPS: es el que se reporta en el RIPS.
        Se aplica a todos los tarifarios que usan ese código. Las sugerencias comparan las
        descripciones y siempre deben revisarse antes de guardar.
      </p>

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

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Segmented
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value as CupsHomologationStatus)
            setPage(1)
          }}
        />
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar por código, descripción o CUPS"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      <Table<CupsHomologationItem>
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
          showTotal: (total) => `${total} códigos`,
          onChange: (nextPage, nextSize) => {
            setPage(nextSize !== pageSize ? 1 : nextPage)
            setPageSize(nextSize)
          },
        }}
        locale={{
          emptyText: status === "pending" ? "No hay códigos pendientes de homologar" : "Sin resultados",
        }}
      />
    </Container>
  )
}
