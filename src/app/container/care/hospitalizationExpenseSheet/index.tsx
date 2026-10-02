"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import {
  useActualizarCantidadGasto,
  useBuscarConceptosGasto,
  useEliminarRegistroGasto,
  useGetAsistenciales,
  useGetHojaGastosRegistros,
  useGuardarHojaGastos,
} from "@/core/hooks/care/hojaGastos/useHojaGastos"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  TIPOS_SERVICIO_GASTOS,
  type ConceptoGasto,
  type ConceptoTipo,
  type HojaGastoRegistro,
  type TipoHojaGastos,
  type TipoServicioGastos,
} from "@/core/interfaces/care/hojaGastos"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import "./hospitalizationExpenseSheet.css"

const TIPO_HOJA: TipoHojaGastos = "Hospitalizacion"
const MAX_CANTIDAD = 100000
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000

interface PendingItem {
  key: string
  tipoServicio: TipoServicioGastos
  conceptoTipo: ConceptoTipo
  conceptoId: number
  codigo: string
  descripcion: string
  cantidad: number
}

const pad = (n: number) => n.toString().padStart(2, "0")

// Valor para <input type="datetime-local"> en hora local (toISOString daría UTC).
const nowLocalDateTime = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
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

const conceptKey = (tipoServicio: string, conceptoTipo: string, conceptoId: number) =>
  `${tipoServicio}|${conceptoTipo}|${conceptoId}`

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const isValidQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_CANTIDAD

const HospitalizationExpenseSheet = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()

  const admissionId = searchParams.get("admissionId") || undefined

  /* ─────────────── Datos del paciente ─────────────── */

  const {
    data: admission,
    isLoading: loadingAdmission,
    isError: admissionError,
  } = useGetAdmissionById(admissionId)
  const patientId =
    (admission?.patientId ? String(admission.patientId) : null) ||
    searchParams.get("patientId")
  const { data: patientRecord } = useGetPatientById(patientId)

  /* ─────────────── Formulario ─────────────── */

  const [dateTime, setDateTime] = useState(nowLocalDateTime)
  const [asistencialId, setAsistencialId] = useState<number | undefined>()
  const [tipoServicio, setTipoServicio] = useState<TipoServicioGastos>("Medicamentos")
  const [searchText, setSearchText] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [items, setItems] = useState<PendingItem[]>([])
  const [editingPendingKey, setEditingPendingKey] = useState<string | null>(null)
  const [pendingDraftQty, setPendingDraftQty] = useState<number | null>(null)
  const [editingSavedId, setEditingSavedId] = useState<number | null>(null)
  const [savedDraftQty, setSavedDraftQty] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText), 300)
    return () => window.clearTimeout(timer)
  }, [searchText])

  const {
    data: asistenciales,
    isLoading: loadingAsistenciales,
    isError: asistencialesError,
  } = useGetAsistenciales()
  const {
    data: conceptos,
    isFetching: searchingConceptos,
    isError: conceptosError,
  } = useBuscarConceptosGasto(tipoServicio, debouncedSearch)
  const {
    data: registros,
    isLoading: loadingRegistros,
    isError: registrosError,
  } = useGetHojaGastosRegistros(admissionId, TIPO_HOJA)

  const guardar = useGuardarHojaGastos()
  const actualizarCantidad = useActualizarCantidadGasto()
  const eliminarRegistro = useEliminarRegistroGasto()

  const asistencialOptions = useMemo(
    () =>
      (asistenciales ?? []).map((a) => ({
        value: a.id,
        label: a.especialidad ? `${a.nombreCompleto} - ${a.especialidad}` : a.nombreCompleto,
      })),
    [asistenciales],
  )

  const conceptoOptions = useMemo(
    () =>
      (conceptos ?? []).map((c) => ({
        value: `${c.conceptoTipo}-${c.conceptoId}`,
        label: `${c.codigo} - ${c.descripcion}${c.detalle ? ` (${c.detalle})` : ""}`,
        concepto: c,
      })),
    [conceptos],
  )

  /* ─────────────── Paciente ─────────────── */

  const patientName =
    [
      patientRecord?.firstName,
      patientRecord?.middleName,
      patientRecord?.lastName,
      patientRecord?.secondLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    admission?.nombrePaciente ||
    searchParams.get("patientName") ||
    ""
  const identification = [
    patientRecord?.documentTypeCode || admission?.documentTypeCode,
    patientRecord?.documentNumber || admission?.documentoPatiente || searchParams.get("documentNumber"),
  ]
    .filter(Boolean)
    .join(" ")
  const admissionDate = admission?.admissionDate || searchParams.get("admissionDate") || ""
  const activeService = admission?.careScopeName || searchParams.get("careScope") || ""

  /* ─────────────── Registros pendientes ─────────────── */

  const addConcepto = (concepto: ConceptoGasto) => {
    if (!concepto.codigo?.trim() || !concepto.conceptoId) {
      messageApi.error("El concepto seleccionado no tiene código; no se puede cargar.")
      return
    }

    const key = conceptKey(tipoServicio, concepto.conceptoTipo, concepto.conceptoId)
    const exists = items.some((item) => item.key === key)

    // Mismo concepto y tipo de servicio: se suma la cantidad en lugar de duplicar la fila.
    setItems((current) =>
      exists
        ? current.map((item) =>
            item.key === key
              ? { ...item, cantidad: Math.min(item.cantidad + 1, MAX_CANTIDAD) }
              : item,
          )
        : [
            ...current,
            {
              key,
              tipoServicio,
              conceptoTipo: concepto.conceptoTipo,
              conceptoId: concepto.conceptoId,
              codigo: concepto.codigo.trim(),
              descripcion: concepto.descripcion,
              cantidad: 1,
            },
          ],
    )

    messageApi.success(
      exists
        ? `Se sumó una unidad a ${concepto.descripcion}.`
        : `${concepto.descripcion} agregado a los registros.`,
    )
    setSearchText("")
    setValidationErrors([])
  }

  const startEditPending = (item: PendingItem) => {
    setEditingPendingKey(item.key)
    setPendingDraftQty(item.cantidad)
  }

  const confirmEditPending = () => {
    if (!editingPendingKey) return
    if (!isValidQuantity(pendingDraftQty)) {
      messageApi.error("La cantidad debe ser un número entero mayor a cero.")
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.key === editingPendingKey ? { ...item, cantidad: pendingDraftQty } : item,
      ),
    )
    setEditingPendingKey(null)
    setPendingDraftQty(null)
  }

  const removePending = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
    if (editingPendingKey === key) setEditingPendingKey(null)
    messageApi.success("Registro retirado de la hoja.")
  }

  /* ─────────────── Guardar ─────────────── */

  const validate = () => {
    const errors: string[] = []

    if (!asistencialId) errors.push("Seleccione el asistencial que firma.")

    if (!dateTime) {
      errors.push("Indique la fecha y hora del registro.")
    } else {
      const date = new Date(dateTime)
      if (Number.isNaN(date.getTime())) errors.push("La fecha y hora no es válida.")
      else if (date.getTime() > Date.now() + FUTURE_TOLERANCE_MS)
        errors.push("La fecha y hora no puede ser futura.")
    }

    if (items.length === 0) errors.push("Cargue al menos un medicamento, insumo o material.")
    if (items.some((item) => !isValidQuantity(item.cantidad)))
      errors.push("Todas las cantidades deben ser mayores a cero.")
    if (items.some((item) => !item.codigo || !item.conceptoId))
      errors.push("Hay registros sin código del concepto.")
    if (editingPendingKey) errors.push("Confirme o cancele la cantidad que está editando.")

    return errors
  }

  const handleSave = async () => {
    if (!admissionId) return

    const errors = validate()
    setValidationErrors(errors)
    if (errors.length > 0) {
      messageApi.error("Complete la información obligatoria antes de guardar.")
      return
    }

    try {
      const result = await guardar.mutateAsync({
        admissionId: Number(admissionId),
        tipoHoja: TIPO_HOJA,
        fechaHoraRegistro: new Date(dateTime).toISOString(),
        asistencialId: asistencialId!,
        items: items.map((item) => ({
          tipoServicio: item.tipoServicio,
          conceptoTipo: item.conceptoTipo,
          conceptoId: item.conceptoId,
          cantidad: item.cantidad,
        })),
      })

      // Solo se limpia lo cargado cuando el guardado fue exitoso; ante un error
      // la información diligenciada se conserva.
      setItems([])
      setValidationErrors([])
      const creados = result?.creados ?? 0
      const actualizados = result?.actualizados ?? 0
      messageApi.success(
        `Hoja de gastos guardada correctamente: ${creados} registro(s) nuevo(s)` +
          (actualizados > 0 ? ` y ${actualizados} actualizado(s).` : "."),
      )
    } catch (err) {
      messageApi.error(
        `${errorMessage(err, "No se pudo guardar la hoja de gastos.")} La información cargada se conservó.`,
      )
    }
  }

  /* ─────────────── Registros guardados ─────────────── */

  const confirmEditSaved = async (registro: HojaGastoRegistro) => {
    if (!isValidQuantity(savedDraftQty)) {
      messageApi.error("La cantidad debe ser un número entero mayor a cero.")
      return
    }
    try {
      await actualizarCantidad.mutateAsync({ id: registro.id, cantidad: savedDraftQty })
      setEditingSavedId(null)
      setSavedDraftQty(null)
      messageApi.success("Cantidad actualizada.")
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo actualizar la cantidad."))
    }
  }

  const deleteSaved = async (registro: HojaGastoRegistro) => {
    try {
      await eliminarRegistro.mutateAsync({ id: registro.id })
      if (editingSavedId === registro.id) setEditingSavedId(null)
      messageApi.success("Registro eliminado de la hoja de gastos.")
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo eliminar el registro."))
    }
  }

  /* ─────────────── Columnas ─────────────── */

  const quantityEditor = (
    value: number | null,
    onChange: (v: number | null) => void,
    onConfirm: () => void,
    onCancel: () => void,
    loading = false,
  ) => (
    <div style={{ display: "flex", gap: 4 }}>
      <InputNumber
        autoFocus
        min={1}
        max={MAX_CANTIDAD}
        precision={0}
        value={value}
        onChange={(v) => onChange(typeof v === "number" ? v : null)}
        onPressEnter={onConfirm}
        style={{ width: 90 }}
      />
      <Button size="small" type="primary" icon={<CheckOutlined />} loading={loading} onClick={onConfirm} />
      <Button size="small" icon={<CloseOutlined />} onClick={onCancel} disabled={loading} />
    </div>
  )

  const pendingColumns: ColumnsType<PendingItem> = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 120,
      render: (codigo: string) => <span style={{ fontWeight: 700 }}>{codigo}</span>,
    },
    { title: "Desc. general / comercial", dataIndex: "descripcion", key: "descripcion" },
    {
      title: "Tipo de servicio",
      dataIndex: "tipoServicio",
      key: "tipoServicio",
      width: 160,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: "Cant.",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 190,
      render: (cantidad: number, record) =>
        editingPendingKey === record.key
          ? quantityEditor(pendingDraftQty, setPendingDraftQty, confirmEditPending, () =>
              setEditingPendingKey(null),
            )
          : <strong>{cantidad}</strong>,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 110,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Tooltip title="Editar cantidad">
            <Button icon={<EditOutlined />} onClick={() => startEditPending(record)} />
          </Tooltip>
          <Popconfirm
            title="¿Retirar este registro?"
            description="El elemento se quitará de la lista antes de guardar."
            okText="Retirar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => removePending(record.key)}
          >
            <Tooltip title="Eliminar registro">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  const savedColumns: ColumnsType<HojaGastoRegistro> = [
    {
      title: "Fecha y hora",
      dataIndex: "fechaHoraRegistro",
      key: "fechaHoraRegistro",
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Tipo de servicio",
      dataIndex: "tipoServicio",
      key: "tipoServicio",
      width: 150,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    { title: "Código", dataIndex: "codigo", key: "codigo", width: 110 },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
    {
      title: "Cant.",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 190,
      render: (cantidad: number, record) =>
        editingSavedId === record.id
          ? quantityEditor(
              savedDraftQty,
              setSavedDraftQty,
              () => confirmEditSaved(record),
              () => setEditingSavedId(null),
              actualizarCantidad.isPending,
            )
          : <strong>{cantidad}</strong>,
    },
    {
      title: "Asistencial que firma",
      key: "asistencial",
      render: (_, record) =>
        record.asistencialEspecialidad
          ? `${record.asistencialNombre} - ${record.asistencialEspecialidad}`
          : record.asistencialNombre,
    },
    {
      title: "Registrado por",
      key: "usuario",
      width: 170,
      render: (_, record) => (
        <div>
          <div>{record.usuarioNombre}</div>
          <small style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
            {formatDateTime(record.createdAt)}
          </small>
        </div>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 110,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Tooltip title="Editar cantidad">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingSavedId(record.id)
                setSavedDraftQty(record.cantidad)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este registro guardado?"
            description="El registro dejará de hacer parte de la hoja de gastos."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: eliminarRegistro.isPending }}
            onConfirm={() => deleteSaved(record)}
          >
            <Tooltip title="Eliminar registro">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  /* ─────────────── Render ─────────────── */

  const header = (
    <div className="hes-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FileTextOutlined style={{ fontSize: 24, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Hoja de Gastos Hospitalización</Title>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
        {admissionId && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={guardar.isPending}
            onClick={handleSave}
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  )

  if (!admissionId) {
    return (
      <Container fluid padding="md">
        {header}
        <Empty description="Selecciona un paciente desde Evolucionar HC para abrir esta hoja con contexto clínico.">
          <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
            Ir a Evolucionar HC
          </Button>
        </Empty>
      </Container>
    )
  }

  const patientItems = [
    { label: "Paciente", value: patientName },
    { label: "Identificación", value: identification },
    { label: "Admisión", value: admissionId },
    { label: "Fecha y hora de admisión", value: formatDateTime(admissionDate) },
    { label: "Servicio activo", value: activeService },
    { label: "Tipo de servicio", value: tipoServicio },
  ]

  const showAsistencialError = validationErrors.length > 0 && !asistencialId
  const showDateError = validationErrors.length > 0 && !dateTime

  return (
    <Container fluid padding="md">
      {contextHolder}
      {header}

      <p className="hes-description">
        Registro de medicamentos, insumos quirúrgicos y material estéril utilizados durante la
        hospitalización del paciente.
      </p>

      {/* ════ Información del paciente ════ */}
      <div className="hes-card">
        <div className="hes-card-title">
          <UserOutlined /> Paciente seleccionado
        </div>
        {admissionError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            title="No se pudo cargar la admisión del paciente."
          />
        )}
        {loadingAdmission ? (
          <Skeleton active title={false} paragraph={{ rows: 2 }} />
        ) : (
          <div className="hes-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="hes-label">{item.label}</span>
                <span className="hes-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ Datos del cargue ════ */}
      <div className="hes-card">
        {validationErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title="Falta información obligatoria"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            }
          />
        )}

        <div className="hes-control-grid">
          <label className="hes-field">
            <span>
              Fecha y hora <span className="hes-required">*</span>
            </span>
            <Input
              type="datetime-local"
              value={dateTime}
              max={nowLocalDateTime()}
              status={showDateError ? "error" : undefined}
              onChange={(event) => setDateTime(event.target.value)}
              prefix={<CalendarOutlined />}
            />
          </label>

          <label className="hes-field hes-field-signature">
            <span>
              Asistencial que firma <span className="hes-required">*</span>
            </span>
            <Select
              value={asistencialId}
              onChange={(value) => setAsistencialId(value)}
              options={asistencialOptions}
              loading={loadingAsistenciales}
              placeholder="Seleccione el asistencial"
              showSearch
              optionFilterProp="label"
              allowClear
              status={showAsistencialError ? "error" : undefined}
              popupMatchSelectWidth={false}
              notFoundContent={
                loadingAsistenciales
                  ? "Cargando asistenciales..."
                  : asistencialesError
                    ? "No se pudieron cargar los asistenciales"
                    : "No hay asistenciales habilitados"
              }
              style={{ width: "100%" }}
            />
          </label>

          <label className="hes-field">
            <span>Tipo de servicio</span>
            <Select
              value={tipoServicio}
              onChange={(value: TipoServicioGastos) => {
                setTipoServicio(value)
                setSearchText("")
              }}
              options={TIPOS_SERVICIO_GASTOS.map((value) => ({ value, label: value }))}
              suffixIcon={<MedicineBoxOutlined />}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginTop: 14 }}>
          <Select
            showSearch
            value={null}
            searchValue={searchText}
            onSearch={setSearchText}
            filterOption={false}
            options={conceptoOptions}
            onSelect={(_value, option) => {
              const concepto = (option as { concepto?: ConceptoGasto }).concepto
              if (concepto) addConcepto(concepto)
            }}
            placeholder={`Buscar ${tipoServicio.toLowerCase()} por código o descripción`}
            suffixIcon={searchingConceptos ? <Spin size="small" /> : <SearchOutlined />}
            notFoundContent={
              searchingConceptos
                ? "Buscando..."
                : conceptosError
                  ? "No se pudo consultar el catálogo"
                  : "Sin resultados en el catálogo"
            }
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* ════ Registros asociados (pendientes por guardar) ════ */}
      <div className="hes-card hes-card-flush">
        <div className="hes-table-header">
          <div>
            <div style={{ fontWeight: 800 }}>Registros asociados</div>
            <div className="hes-muted">
              {items.length} registro(s) pendiente(s) por guardar
            </div>
          </div>
          {items.length > 0 && <Tag color="orange">Sin guardar</Tag>}
        </div>
        <Table<PendingItem>
          rowKey="key"
          columns={pendingColumns}
          dataSource={items}
          pagination={false}
          scroll={{ x: 760 }}
          locale={{
            emptyText: <Empty description="Busque y seleccione un concepto para agregarlo." />,
          }}
        />
        <div className="hes-footer-actions">
          <Popconfirm
            title="¿Descartar todos los registros sin guardar?"
            okText="Descartar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            disabled={items.length === 0}
            onConfirm={() => {
              setItems([])
              setEditingPendingKey(null)
              setValidationErrors([])
            }}
          >
            <Button disabled={items.length === 0 || guardar.isPending}>Descartar</Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={guardar.isPending}
            onClick={handleSave}
          >
            Guardar
          </Button>
        </div>
      </div>

      {/* ════ Registros guardados ════ */}
      <div className="hes-card hes-card-flush">
        <div className="hes-table-header">
          <div style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}>
            <HistoryOutlined /> Registros guardados en esta hospitalización
          </div>
          <Tag color="green">{registros?.length ?? 0}</Tag>
        </div>
        {registrosError ? (
          <Alert
            type="error"
            showIcon
            style={{ margin: 16 }}
            title="No se pudieron cargar los registros guardados."
          />
        ) : (
          <Table<HojaGastoRegistro>
            rowKey="id"
            columns={savedColumns}
            dataSource={registros ?? []}
            loading={loadingRegistros}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 1100 }}
            locale={{ emptyText: "Aún no hay gastos guardados para esta hospitalización." }}
          />
        )}
      </div>
    </Container>
  )
}

export default HospitalizationExpenseSheet
