"use client"

import {
  Alert,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  TimePicker,
} from "antd"
import type { FormInstance } from "antd"
import type { NamePath } from "antd/es/form/interface"
import {
  CloseOutlined,
  CopyOutlined,
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import toast from "react-hot-toast"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import {
  FURIPS_ADRES,
  FURIPS_CONDICIONES_ACCIDENTADO,
  FURIPS_ESTADOS_ASEGURAMIENTO,
  FURIPS_SI_NO,
  FURIPS_TIPOS_ATENCION_INICIAL,
  FURIPS_TIPOS_DOCUMENTO,
  FURIPS_TIPOS_SERVICIO,
  FURIPS_ZONAS,
  furipsRequierePlaca,
  furipsRequierePoliza,
} from "@/core/constants/furips"
import {
  useGetFuripsByAdmission,
  useGetFuripsDatosSistema,
  useSaveFurips,
} from "@/core/hooks/care/furips/useFurips"
import { useSearchCie10 } from "@/core/hooks/care/cie10/useSearchCie10"
import { useGetProfessionals } from "@/core/hooks/users/useGetProfessionals"
import { useCities } from "@/core/hooks/utils/useCities"
import { useStates } from "@/core/hooks/utils/useStates"
import type {
  FuripsDatosSistema,
  FuripsDiagnostico,
  FuripsResponse,
} from "@/core/interfaces/care/furips"
import type { TCities, TStates } from "@/core/interfaces/user/users"
import { formatDate } from "@/core/utils/date"
import FuripsPrintModal from "./FuripsPrintModal"
import { useInsurerOptions } from "./useInsurerOptions"
import {
  PERSONA_CAMPOS,
  PLACA_PATTERN,
  REMISION_ACTIVADORES,
  TRANSPORTE_CAMPOS,
  groupRequired,
  isFilled,
  toFormValues,
  toRequest,
  type FuripsFormValues,
} from "./furips.utils"
import "./furips.css"

export type FuripsFormMode = "admission" | "billing"

interface FuripsFormProps {
  admissionId: number
  // En Admisiones se crea y edita; en Facturación solo se edita y se agregan el
  // encabezado de radicación y los amparos.
  mode: FuripsFormMode
  onClose?: () => void
}

export default function FuripsForm({ admissionId, mode, onClose }: FuripsFormProps) {
  const datosQuery = useGetFuripsDatosSistema(admissionId, INSTITUTION_PROVIDER_ID)
  const furipsQuery = useGetFuripsByAdmission(admissionId)
  const { data: cities = [], isLoading: loadingCities } = useCities()
  const { data: states = [], isLoading: loadingStates } = useStates()

  if (datosQuery.isLoading || furipsQuery.isLoading || loadingCities || loadingStates) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (datosQuery.error || furipsQuery.error || !datosQuery.data) {
    return (
      <Alert
        type="error"
        showIcon
        message="No se pudo cargar el FURIPS"
        description={(datosQuery.error ?? furipsQuery.error)?.message}
      />
    )
  }

  if (mode === "billing" && !furipsQuery.data) {
    return (
      <Empty description="La admisión no tiene FURIPS registrado. Regístrelo desde Admisiones." />
    )
  }

  return (
    <FuripsFormContent
      key={furipsQuery.data?.id ?? "nuevo"}
      admissionId={admissionId}
      mode={mode}
      datos={datosQuery.data}
      furips={furipsQuery.data ?? null}
      cities={cities}
      states={states}
      onClose={onClose}
    />
  )
}

interface ContentProps {
  admissionId: number
  mode: FuripsFormMode
  datos: FuripsDatosSistema
  furips: FuripsResponse | null
  cities: TCities[]
  states: TStates[]
  onClose?: () => void
}

function FuripsFormContent({
  admissionId,
  mode,
  datos,
  furips,
  cities,
  states,
  onClose,
}: ContentProps) {
  const [form] = Form.useForm<FuripsFormValues>()
  const saveMutation = useSaveFurips()
  const [printRecord, setPrintRecord] = useState<FuripsResponse | null>(null)
  const { data: professionals = [] } = useGetProfessionals()
  const insurerOptions = useInsurerOptions()

  const initialValues = useMemo(
    () => toFormValues(furips, datos, cities),
    // Los valores iniciales se calculan una vez por FURIPS (el `key` del padre lo reinicia).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const estado = Form.useWatch("estadoAseguramiento", form)
  const respuestaGlosa = Form.useWatch("respuestaGlosa", form)
  const codigoAseguradora = Form.useWatch("codigoAseguradora", form)
  const nombreAseguradora = Form.useWatch("nombreAseguradora", form)
  const isBilling = mode === "billing"

  // Sin SOAT vigente la reclamación va a la ADRES.
  const handleEstadoChange = (value: string) => {
    if (!furipsRequierePoliza(value) && !isFilled(form.getFieldValue("codigoAseguradora"))) {
      form.setFieldsValue({
        codigoAseguradora: FURIPS_ADRES.codigo,
        nombreAseguradora: FURIPS_ADRES.nombre,
      })
    }
  }

  const save = async () => {
    try {
      await form.validateFields()
    } catch {
      toast.error("Revise los campos marcados en el formulario")
      return null
    }

    const request = toRequest(form.getFieldsValue(true), furips, admissionId)
    try {
      const saved = await saveMutation.mutateAsync({ id: furips?.id, data: request })
      toast.success(furips ? "FURIPS actualizado" : "FURIPS registrado")
      return saved
    } catch (error) {
      toast.error((error as Error).message)
      return null
    }
  }

  const handlePrint = async () => {
    const saved = await save()
    if (saved) setPrintRecord(saved)
  }

  const victima = datos.victima

  const copyVictimaTo = (target: "propietario" | "conductor") => {
    form.setFieldValue(target, {
      primerApellido: victima.primerApellido,
      segundoApellido: victima.segundoApellido,
      primerNombre: victima.primerNombre,
      segundoNombre: victima.segundoNombre,
      tipoDocumento: victima.tipoDocumento,
      numeroDocumento: victima.numeroDocumento,
      direccion: victima.direccion,
      telefono: victima.telefono,
      cityId: victima.cityId,
      stateId: cities.find((c) => c.id === victima.cityId)?.stateId ?? null,
    })
    form.validateFields(PERSONA_CAMPOS.map((f) => [target, f]))
  }

  const copyPropietarioToConductor = () => {
    form.setFieldValue("conductor", { ...form.getFieldValue("propietario") })
    form.validateFields(PERSONA_CAMPOS.map((f) => ["conductor", f]))
  }

  return (
    <>
      <Form<FuripsFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        className="furips-form"
        requiredMark
        scrollToFirstError
      >
        {!datos.admissionActiva && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="La admisión está cerrada. El FURIPS se puede consultar y editar."
          />
        )}

        {isBilling && (
          <Section numeral="—" title="Encabezado de radicación" tone="primary">
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item name="fechaRadicacion" label="Fecha de radicación">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="numeroRadicado" label="No. radicado">
                  <Input maxLength={30} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="numeroFactura" label="No. factura / cuenta de cobro">
                  <Input maxLength={30} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="respuestaGlosa" label="RG (respuesta a glosa)" valuePropName="checked">
                  <Checkbox>Es respuesta a glosa</Checkbox>
                </Form.Item>
              </Col>
              {respuestaGlosa && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="numeroRadicadoAnterior"
                    label="No. radicado anterior"
                    rules={[{ required: true, whitespace: true, message: "Indique el radicado anterior" }]}
                  >
                    <Input maxLength={30} />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Section>
        )}

        <Section numeral="—" title="Datos generales del evento" tone="primary">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="serviciosHabilitados" label="Servicios habilitados">
                <Radio.Group options={FURIPS_SI_NO} optionType="button" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="tipoAtencionInicial" label="Tipo de atención inicial">
                <Select allowClear options={FURIPS_TIPOS_ATENCION_INICIAL} placeholder="— Seleccione —" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="cobroTopeAseguradora" label="Cobro tope aseguradora">
                <Radio.Group options={FURIPS_SI_NO} optionType="button" />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section numeral="I" title="Datos de la institución prestadora de servicios de salud">
          <Descriptions size="small" bordered column={{ xs: 1, md: 3 }} className="furips-readonly">
            <Descriptions.Item label="Razón social" span={2}>{datos.ips.razonSocial || "—"}</Descriptions.Item>
            <Descriptions.Item label="NIT">{datos.ips.nit || "—"}</Descriptions.Item>
            <Descriptions.Item label="Código habilitación">{datos.ips.codigoHabilitacion || "—"}</Descriptions.Item>
            <Descriptions.Item label="Dirección">{datos.ips.direccion || "—"}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{datos.ips.telefono || "—"}</Descriptions.Item>
            <Descriptions.Item label="Departamento">
              {withCode(datos.ips.departamento, datos.ips.codigoDepartamento)}
            </Descriptions.Item>
            <Descriptions.Item label="Municipio" span={2}>
              {withCode(datos.ips.municipio, datos.ips.codigoMunicipio)}
            </Descriptions.Item>
          </Descriptions>
          <p className="furips-section-hint">Se toman de Parametrización → Datos IPS.</p>
        </Section>

        <Section numeral="II" title="Datos de la víctima del accidente de tránsito">
          <Descriptions size="small" bordered column={{ xs: 1, md: 3 }} className="furips-readonly">
            <Descriptions.Item label="Nombre" span={2}>
              {[victima.primerApellido, victima.segundoApellido, victima.primerNombre, victima.segundoNombre]
                .filter(Boolean)
                .join(" ")}
            </Descriptions.Item>
            <Descriptions.Item label="Documento">
              {victima.tipoDocumento} {victima.numeroDocumento}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de nacimiento">{formatDate(victima.fechaNacimiento)}</Descriptions.Item>
            <Descriptions.Item label="Sexo">{victima.sexo || "—"}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{victima.telefono || "—"}</Descriptions.Item>
            <Descriptions.Item label="Dirección" span={3}>{victima.direccion || "—"}</Descriptions.Item>
            <Descriptions.Item label="Departamento">
              {withCode(victima.departamento, victima.codigoDepartamento)}
            </Descriptions.Item>
            <Descriptions.Item label="Municipio" span={2}>
              {withCode(victima.municipio, victima.codigoMunicipio)}
            </Descriptions.Item>
          </Descriptions>
          <Form.Item
            name="condicionAccidentado"
            label="Condición del accidentado"
            rules={[{ required: true, message: "Seleccione la condición del accidentado" }]}
          >
            <Radio.Group options={FURIPS_CONDICIONES_ACCIDENTADO} optionType="button" buttonStyle="solid" />
          </Form.Item>
        </Section>

        <Section numeral="III" title="Datos del sitio donde ocurrió el accidente de tránsito" tone="primary">
          <p className="furips-section-hint">
            Naturaleza del evento: <Tag color="blue">Accidente de tránsito</Tag>
          </p>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="direccionEvento"
                label="Dirección de la ocurrencia"
                rules={[{ required: true, whitespace: true, message: "Indique la dirección del accidente" }]}
              >
                <Input maxLength={200} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="fechaEvento"
                label="Fecha del accidente"
                dependencies={["horaEvento"]}
                rules={[
                  { required: true, message: "Indique la fecha del accidente" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve()
                      const hora = form.getFieldValue("horaEvento") ?? value
                      const evento = value.hour(hora.hour()).minute(hora.minute())
                      if (evento.isAfter(dayjs()))
                        return Promise.reject(new Error("La fecha del accidente no puede ser futura"))
                      if (evento.isAfter(dayjs(datos.admissionDate)))
                        return Promise.reject(new Error("El accidente no puede ser posterior a la admisión"))
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="horaEvento"
                label="Hora del accidente"
                rules={[{ required: true, message: "Indique la hora del accidente" }]}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="zonaEvento" label="Zona">
                <Select allowClear options={FURIPS_ZONAS} placeholder="— Seleccione —" />
              </Form.Item>
            </Col>
            <LocationFields
              form={form}
              stateName="eventoStateId"
              cityName="eventoCityId"
              cities={cities}
              states={states}
              required
            />
            <Col xs={24}>
              <Form.Item
                name="descripcionEvento"
                label="Descripción breve del accidente"
                rules={[{ required: true, whitespace: true, message: "Describa brevemente el accidente" }]}
              >
                <Input.TextArea rows={3} maxLength={1000} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section numeral="IV" title="Datos del vehículo del accidente de tránsito">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="estadoAseguramiento"
                label="Estado de aseguramiento"
                rules={[{ required: true, message: "Seleccione el estado de aseguramiento" }]}
              >
                <Select
                  options={FURIPS_ESTADOS_ASEGURAMIENTO.map((o) => ({ ...o, label: `${o.value} — ${o.label}` }))}
                  placeholder="— Seleccione —"
                  onChange={handleEstadoChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="placa"
                label="Placa"
                dependencies={["estadoAseguramiento"]}
                normalize={(v?: string) => v?.toUpperCase().replace(/[\s-]/g, "")}
                rules={[
                  {
                    required: furipsRequierePlaca(estado),
                    message: "Indique la placa del vehículo",
                  },
                  { pattern: PLACA_PATTERN, message: "Entre 5 y 7 letras o números" },
                ]}
              >
                <Input maxLength={7} placeholder="Ej: ABC123" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="marca" label="Marca">
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="tipoServicio" label="Tipo de servicio">
                <Select allowClear options={FURIPS_TIPOS_SERVICIO} placeholder="— Seleccione —" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="codigoAseguradora"
                label="Aseguradora"
                dependencies={["estadoAseguramiento"]}
                rules={[
                  {
                    required: furipsRequierePoliza(estado),
                    message: "Seleccione la aseguradora del SOAT",
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="— Seleccione —"
                  options={withCurrentInsurer(insurerOptions, codigoAseguradora, nombreAseguradora)}
                  onChange={(code?: string) => {
                    const insurer = insurerOptions.find((o) => o.value === code)
                    form.setFieldValue("nombreAseguradora", insurer?.name ?? null)
                  }}
                />
              </Form.Item>
              <Form.Item name="nombreAseguradora" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="numeroPoliza"
                label="No. de la póliza"
                dependencies={["estadoAseguramiento"]}
                rules={[
                  {
                    required: furipsRequierePoliza(estado),
                    whitespace: true,
                    message: "Indique el número de la póliza",
                  },
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="siras"
                label="Código SIRAS"
                rules={[{ pattern: /^[A-Za-z0-9-]{1,30}$/, message: "Solo letras, números y guiones" }]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item
                name="vigenciaDesde"
                label="Vigencia desde"
                dependencies={["estadoAseguramiento"]}
                rules={[{ required: furipsRequierePoliza(estado), message: "Requerida" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item
                name="vigenciaHasta"
                label="Vigencia hasta"
                dependencies={["estadoAseguramiento", "vigenciaDesde", "fechaEvento"]}
                rules={[
                  { required: furipsRequierePoliza(estado), message: "Requerida" },
                  {
                    validator: (_, value) => {
                      const desde = form.getFieldValue("vigenciaDesde")
                      const evento = form.getFieldValue("fechaEvento")
                      if (!value || !desde) return Promise.resolve()
                      if (desde.isAfter(value, "day"))
                        return Promise.reject(new Error("Anterior a 'desde'"))
                      if (evento && (evento.isBefore(desde, "day") || evento.isAfter(value, "day")))
                        return Promise.reject(new Error("El accidente está fuera de la vigencia"))
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="cobroExcedentePoliza" label="Cobro excedente póliza">
                <Radio.Group options={FURIPS_SI_NO} optionType="button" />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section
          numeral="V"
          title="Datos del propietario del vehículo"
          extra={
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyVictimaTo("propietario")}>
              Igual a la víctima
            </Button>
          }
        >
          <p className="furips-section-hint">
            Opcional. Si diligencia algún dato, se exigen los demás. Para una empresa use el tipo de
            documento NI y escriba la razón social en el primer apellido.
          </p>
          <PersonaFields form={form} prefix="propietario" cities={cities} states={states} allowRazonSocial />
        </Section>

        <Section
          numeral="VI"
          title="Datos del conductor del vehículo"
          extra={
            <Space>
              <Button size="small" icon={<CopyOutlined />} onClick={() => copyVictimaTo("conductor")}>
                Igual a la víctima
              </Button>
              <Button size="small" icon={<CopyOutlined />} onClick={copyPropietarioToConductor}>
                Igual al propietario
              </Button>
            </Space>
          }
        >
          <p className="furips-section-hint">Opcional. Si diligencia algún dato, se exigen los demás.</p>
          <PersonaFields form={form} prefix="conductor" cities={cities} states={states} />
        </Section>

        <Section numeral="VII" title="Datos de remisión (si el paciente llega remitido)" tone="teal">
          <RemisionFields form={form} professionals={professionals} />
        </Section>

        <Section numeral="VIII" title="Amparo de transporte y movilización de la víctima" tone="teal">
          <p className="furips-section-hint">
            Solo el transporte primario: del sitio del accidente a la primera IPS. Opcional, salvo que se
            reclame el amparo de transporte; si diligencia algún dato, se exigen los demás.
          </p>
          <TransporteFields form={form} />
        </Section>

        <Section numeral="IX" title="Datos de la atención médica de la víctima">
          <p className="furips-section-hint">
            Precargados de la admisión, la HC inicial y el egreso. Puede completar los que falten.
          </p>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fechaIngreso"
                label="Fecha de ingreso"
                rules={[{ required: true, message: "Indique la fecha de ingreso" }]}
              >
                <DatePicker showTime={{ format: "HH:mm" }} format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="fechaEgreso"
                label="Fecha de egreso"
                dependencies={["fechaIngreso"]}
                rules={[
                  {
                    validator: (_, value) => {
                      const ingreso = form.getFieldValue("fechaIngreso")
                      return value && ingreso && value.isBefore(ingreso)
                        ? Promise.reject(new Error("El egreso es anterior al ingreso"))
                        : Promise.resolve()
                    },
                  },
                ]}
              >
                <DatePicker showTime={{ format: "HH:mm" }} format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            {[0, 1, 2].flatMap((i) => [
              <Col xs={24} md={12} key={`ing-${i}`}>
                <Form.Item
                  name={["dxIngreso", i]}
                  label={`Diagnóstico ${i + 1} de ingreso`}
                  rules={
                    i === 0 && isBilling
                      ? [{ required: true, message: "Indique el diagnóstico principal de ingreso" }]
                      : []
                  }
                >
                  <Cie10Select />
                </Form.Item>
              </Col>,
              <Col xs={24} md={12} key={`egr-${i}`}>
                <Form.Item name={["dxEgreso", i]} label={`Diagnóstico ${i + 1} de egreso`}>
                  <Cie10Select />
                </Form.Item>
              </Col>,
            ])}
          </Row>
        </Section>

        <Section numeral="X" title="Datos del médico o profesional de la salud tratante">
          <MedicoFields form={form} datos={datos} required={isBilling} />
        </Section>

        {isBilling && (
          <Section numeral="XI" title="Amparos que reclama" tone="primary">
            <AmparosFields form={form} valorFacturado={datos.valorFacturado} />
          </Section>
        )}

        <Section numeral="XII" title="Declaraciones de la institución prestadora de servicios de salud">
          <p className="furips-section-hint" style={{ marginTop: 0 }}>
            Firma el representante legal registrado en Datos IPS:{" "}
            <strong>{datos.ips.representanteLegal || "sin registrar"}</strong>.
          </p>
        </Section>

        <div className="furips-footer">
          {onClose && (
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Cerrar
            </Button>
          )}
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={saveMutation.isPending}
            style={{ background: "#0f766e", color: "#fff", borderColor: "#0f766e" }}
          >
            Imprimir FURIPS
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={save} loading={saveMutation.isPending}>
            Guardar datos
          </Button>
        </div>
      </Form>

      <FuripsPrintModal
        open={!!printRecord}
        onClose={() => setPrintRecord(null)}
        furips={printRecord}
        datos={datos}
        cities={cities}
        states={states}
      />
    </>
  )
}

/* ─────────────── Piezas del formulario ─────────────── */

const withCode = (name?: string | null, code?: string | null) =>
  name ? `${name}${code ? ` (${code})` : ""}` : "—"

function Section({
  numeral,
  title,
  tone,
  extra,
  children,
}: {
  numeral: string
  title: string
  tone?: "primary" | "teal"
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="furips-section">
      <header className={`furips-section-header${tone ? ` is-${tone}` : ""}`}>
        <span className="furips-section-numeral">{numeral}</span>
        <span>{title}</span>
        {extra && <span className="furips-section-extra">{extra}</span>}
      </header>
      <div className="furips-section-body">{children}</div>
    </section>
  )
}

function LocationFields({
  form,
  stateName,
  cityName,
  cities,
  states,
  required,
  rules = [],
  dependencies,
}: {
  form: FormInstance<FuripsFormValues>
  stateName: NamePath
  cityName: NamePath
  cities: TCities[]
  states: TStates[]
  required?: boolean
  rules?: ReturnType<typeof groupRequired>[]
  dependencies?: NamePath[]
}) {
  const stateId = Form.useWatch(stateName, form)
  const cityOptions = useMemo(
    () =>
      cities
        .filter((c) => c.stateId === stateId)
        .map((c) => ({ value: c.id, label: c.name })),
    [cities, stateId],
  )

  return (
    <>
      <Col xs={24} md={12}>
        <Form.Item
          name={stateName}
          label="Departamento"
          dependencies={dependencies}
          rules={required ? [{ required: true, message: "Seleccione el departamento" }] : rules}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="— Seleccione —"
            options={states.map((s) => ({ value: s.id, label: s.name }))}
            onChange={() => form.setFieldValue(cityName, null)}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name={cityName}
          label="Municipio"
          dependencies={dependencies}
          rules={required ? [{ required: true, message: "Seleccione el municipio" }] : rules}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={stateId ? "— Seleccione —" : "Seleccione primero el departamento"}
            disabled={!stateId}
            options={cityOptions}
          />
        </Form.Item>
      </Col>
    </>
  )
}

function PersonaFields({
  form,
  prefix,
  cities,
  states,
  allowRazonSocial,
}: {
  form: FormInstance<FuripsFormValues>
  prefix: "propietario" | "conductor"
  cities: TCities[]
  states: TStates[]
  allowRazonSocial?: boolean
}) {
  const triggers = PERSONA_CAMPOS.map((f) => [prefix, f])
  const tipoDocumento = Form.useWatch([prefix, "tipoDocumento"], form)
  const esRazonSocial = allowRazonSocial && tipoDocumento === "NI"
  const rule = (message: string) => [groupRequired(triggers, message)]

  return (
    <Row gutter={16}>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "primerApellido"]}
          label={allowRazonSocial ? "1er apellido o razón social" : "1er apellido"}
          dependencies={triggers}
          rules={rule(esRazonSocial ? "Indique la razón social" : "Indique el primer apellido")}
        >
          <Input maxLength={esRazonSocial ? 200 : 60} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item name={[prefix, "segundoApellido"]} label="2do apellido">
          <Input maxLength={60} disabled={esRazonSocial} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "primerNombre"]}
          label="1er nombre"
          dependencies={[...triggers, [prefix, "tipoDocumento"]]}
          rules={esRazonSocial ? [] : rule("Indique el primer nombre")}
        >
          <Input maxLength={60} disabled={esRazonSocial} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item name={[prefix, "segundoNombre"]} label="2do nombre">
          <Input maxLength={60} disabled={esRazonSocial} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "tipoDocumento"]}
          label="Tipo de documento"
          dependencies={triggers}
          rules={rule("Seleccione el tipo de documento")}
        >
          <Select allowClear options={FURIPS_TIPOS_DOCUMENTO} placeholder="— Seleccione —" />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "numeroDocumento"]}
          label="No. documento"
          dependencies={triggers}
          rules={rule("Indique el número de documento")}
        >
          <Input maxLength={20} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "telefono"]}
          label="Teléfono"
          dependencies={triggers}
          rules={rule("Indique el teléfono")}
        >
          <Input maxLength={20} />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          name={[prefix, "direccion"]}
          label="Dirección de residencia"
          dependencies={triggers}
          rules={rule("Indique la dirección")}
        >
          <Input maxLength={200} />
        </Form.Item>
      </Col>
      <LocationFields
        form={form}
        stateName={[prefix, "stateId"]}
        cityName={[prefix, "cityId"]}
        cities={cities}
        states={states}
        dependencies={triggers}
        rules={rule("Requerido si diligencia la sección")}
      />
    </Row>
  )
}

function RemisionFields({
  form,
  professionals,
}: {
  form: FormInstance<FuripsFormValues>
  professionals: { id: number; fullName: string; userProfileName: string | null }[]
}) {
  const triggers = REMISION_ACTIVADORES.map((f) => ["remision", f])
  const rule = (message: string) => [groupRequired(triggers, message)]
  const item = (name: string, label: string, message: string, node: ReactNode, md = 8) => (
    <Col xs={24} md={md}>
      <Form.Item name={["remision", name]} label={label} dependencies={triggers} rules={rule(message)}>
        {node}
      </Form.Item>
    </Col>
  )

  return (
    <>
      <div className="furips-subgroup">
        <div className="furips-subgroup-title">IPS que remite al paciente</div>
        <p className="furips-section-hint">
          Déjela vacía si el paciente no llega remitido. Si diligencia algún dato, se exigen todos.
        </p>
        <Row gutter={16}>
          {item("ipsRemiteNombre", "Nombre IPS que remite", "Indique la IPS que remite", <Input maxLength={200} placeholder="Nombre de la IPS externa" />, 12)}
          {item("ipsRemiteNit", "NIT", "Indique el NIT", <Input maxLength={20} placeholder="NIT de la IPS" />, 6)}
          {item(
            "fechaRemision",
            "Fecha de remisión",
            "Indique la fecha de remisión",
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />,
            6,
          )}
          {item("ipsRemiteTelefono", "Teléfono", "Indique el teléfono", <Input maxLength={20} />, 6)}
          {item("ipsRemiteCiudad", "Ciudad", "Indique la ciudad", <Input maxLength={100} />, 6)}
          {item("ipsRemiteDireccion", "Dirección", "Indique la dirección", <Input maxLength={200} />, 12)}
          {item("personaRemite", "Persona que remite", "Indique quién remite", <Input maxLength={200} placeholder="Nombre de quien remitió" />, 12)}
        </Row>
      </div>

      <div className="furips-subgroup">
        <div className="furips-subgroup-title">Persona remitida a (IPS que recibe, normalmente esta institución)</div>
        <Row gutter={16}>
          {item("ipsRecibeNombre", "Nombre IPS que recibe", "Indique la IPS que recibe", <Input maxLength={200} />, 12)}
          <Col xs={24} md={6}>
            <Form.Item name={["remision", "ipsRecibeTelefono"]} label="Teléfono">
              <Input maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name={["remision", "ipsRecibeCiudad"]} label="Ciudad">
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name={["remision", "ipsRecibeDireccion"]} label="Dirección">
              <Input maxLength={200} />
            </Form.Item>
          </Col>
          {item(
            "medicoRecibeUserId",
            "Persona que recibe (médico)",
            "Seleccione el médico que recibe",
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="— Seleccione médico —"
              options={professionals.map((p) => ({
                value: p.id,
                label: p.userProfileName ? `${p.fullName} — ${p.userProfileName}` : p.fullName,
              }))}
              onChange={(id?: number) =>
                form.setFieldValue(
                  ["remision", "medicoRecibeNombre"],
                  professionals.find((p) => p.id === id)?.fullName ?? null,
                )
              }
            />,
            12,
          )}
          <Form.Item name={["remision", "medicoRecibeNombre"]} hidden>
            <Input />
          </Form.Item>
        </Row>
      </div>
    </>
  )
}

function TransporteFields({ form }: { form: FormInstance<FuripsFormValues> }) {
  const triggers = TRANSPORTE_CAMPOS.map((f) => ["transporte", f])
  // Si se reclama el amparo de transporte, la sección es obligatoria.
  const force = (f: FormInstance) => !!f.getFieldValue("amparoTransporte")
  const deps = [...triggers, "amparoTransporte"]
  const rule = (message: string) => [groupRequired(triggers, message, force)]
  const item = (name: string, label: string, node: ReactNode, message?: string, md = 6) => (
    <Col xs={24} md={md}>
      <Form.Item
        name={["transporte", name]}
        label={label}
        dependencies={message ? deps : undefined}
        rules={message ? rule(message) : []}
      >
        {node}
      </Form.Item>
    </Col>
  )

  return (
    <div className="furips-subgroup">
      <div className="furips-subgroup-title">Datos del vehículo y del conductor que transportó a la víctima</div>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item
            name={["transporte", "placa"]}
            label="Placa del vehículo"
            dependencies={deps}
            normalize={(v?: string) => v?.toUpperCase().replace(/[\s-]/g, "")}
            rules={[...rule("Indique la placa"), { pattern: PLACA_PATTERN, message: "Entre 5 y 7 letras o números" }]}
          >
            <Input maxLength={7} placeholder="Ej: ABC123" />
          </Form.Item>
        </Col>
        {item(
          "tipoDocumento",
          "Tipo documento conductor",
          <Select allowClear options={FURIPS_TIPOS_DOCUMENTO.filter((o) => o.value !== "NI")} placeholder="— Seleccione —" />,
          "Seleccione el tipo de documento",
        )}
        {item("numeroDocumento", "Documento conductor", <Input maxLength={20} />, "Indique el documento")}
        {item(
          "zona",
          "Zona",
          <Select allowClear options={FURIPS_ZONAS} placeholder="— Seleccione —" />,
          "Seleccione la zona",
        )}
        {item("primerApellido", "1er apellido", <Input maxLength={60} />, "Indique el primer apellido")}
        {item("segundoApellido", "2do apellido", <Input maxLength={60} />)}
        {item("primerNombre", "1er nombre", <Input maxLength={60} />, "Indique el primer nombre")}
        {item("segundoNombre", "2do nombre", <Input maxLength={60} />)}
        {item(
          "transportoDesde",
          "Transportó la víctima desde",
          <Input maxLength={200} placeholder="Sitio desde donde se trasladó" />,
          "Indique desde dónde se transportó",
          24,
        )}
      </Row>
    </div>
  )
}

// En Facturación (al preparar la reclamación) el médico es obligatorio; al admitir al
// paciente puede que aún no lo haya atendido nadie.
function MedicoFields({
  form,
  datos,
  required: requiredForClaim,
}: {
  form: FormInstance<FuripsFormValues>
  datos: FuripsDatosSistema
  required: boolean
}) {
  const fill = (userId?: number) => {
    const medico = datos.medicos.find((m) => m.userId === userId)
    if (!medico) {
      form.setFieldValue("medico", { userId: null })
      return
    }
    const { origen: _origen, nombreCompleto: _nombre, ...campos } = medico
    form.setFieldValue("medico", campos)
  }
  const requiredRule = (message: string) =>
    requiredForClaim ? [{ required: true, whitespace: true, message }] : []

  return (
    <Row gutter={16}>
      <Col xs={24}>
        <Form.Item
          name={["medico", "userId"]}
          label="Profesional que atendió"
          extra={
            datos.medicos.length === 0
              ? "No hay profesionales en la HC inicial, evoluciones o egreso de la admisión; diligencie los datos a mano."
              : "Los nombres se separan automáticamente; corríjalos si quedaron mal."
          }
        >
          <Select
            allowClear
            placeholder="— Seleccione —"
            onChange={fill}
            options={datos.medicos.map((m) => ({
              value: m.userId,
              label: `${m.nombreCompleto} (${m.origen})`,
            }))}
          />
        </Form.Item>
      </Col>
      {(
        [
          ["primerApellido", "1er apellido", true],
          ["segundoApellido", "2do apellido", false],
          ["primerNombre", "1er nombre", true],
          ["segundoNombre", "2do nombre", false],
        ] as const
      ).map(([name, label, required]) => (
        <Col xs={24} md={6} key={name}>
          <Form.Item
            name={["medico", name]}
            label={label}
            rules={required ? requiredRule(`Indique el ${label}`) : []}
          >
            <Input maxLength={60} />
          </Form.Item>
        </Col>
      ))}
      <Col xs={24} md={8}>
        <Form.Item
          name={["medico", "tipoDocumento"]}
          label="Tipo de documento"
          rules={requiredForClaim ? [{ required: true, message: "Seleccione el tipo de documento" }] : []}
        >
          <Select allowClear options={FURIPS_TIPOS_DOCUMENTO.filter((o) => o.value !== "NI")} placeholder="— Seleccione —" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name={["medico", "numeroDocumento"]}
          label="No. documento"
          rules={requiredRule("Indique el documento")}
        >
          <Input maxLength={20} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name={["medico", "registroMedico"]}
          label="No. de registro médico"
          rules={requiredRule("Indique el registro médico")}
        >
          <Input maxLength={30} />
        </Form.Item>
      </Col>
    </Row>
  )
}

function AmparosFields({
  form,
  valorFacturado,
}: {
  form: FormInstance<FuripsFormValues>
  valorFacturado: number
}) {
  const money = {
    min: 0,
    style: { width: "100%" },
    formatter: moneyFormatter,
    parser: (v?: string) => Number((v ?? "").replace(/[$\s,]/g, "")),
  }
  const reclamadoRule = (facturado: keyof FuripsFormValues) => ({
    validator: (_: unknown, value?: number) =>
      (value ?? 0) > (form.getFieldValue(facturado) ?? 0)
        ? Promise.reject(new Error("Supera el valor facturado"))
        : Promise.resolve(),
  })

  return (
    <>
      <table className="furips-amparos">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Amparo</th>
            <th>Marque</th>
            <th>Valor total facturado</th>
            <th>Valor reclamado al ADRES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Gastos médico-quirúrgicos</strong></td>
            <td style={{ textAlign: "center" }}>
              <Form.Item name="amparoGastosMedicos" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </td>
            <td>
              <Form.Item name="valorFacturadoGastosMedicos">
                <InputNumber {...money} />
              </Form.Item>
            </td>
            <td>
              <Form.Item
                name="valorReclamadoGastosMedicos"
                dependencies={["valorFacturadoGastosMedicos"]}
                rules={[reclamadoRule("valorFacturadoGastosMedicos")]}
              >
                <InputNumber {...money} />
              </Form.Item>
            </td>
          </tr>
          <tr>
            <td><strong>Gastos de transporte y movilización de la víctima</strong></td>
            <td style={{ textAlign: "center" }}>
              <Form.Item name="amparoTransporte" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </td>
            <td>
              <Form.Item name="valorFacturadoTransporte">
                <InputNumber {...money} />
              </Form.Item>
            </td>
            <td>
              <Form.Item
                name="valorReclamadoTransporte"
                dependencies={["valorFacturadoTransporte"]}
                rules={[reclamadoRule("valorFacturadoTransporte")]}
              >
                <InputNumber {...money} />
              </Form.Item>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="furips-section-hint">
        Total facturado en la admisión: <strong>{moneyFormatter(valorFacturado)}</strong>. El detalle
        de lo reclamado va en el Anexo técnico 2.
      </p>
    </>
  )
}

const moneyFormatter = (v?: number | string) =>
  `$ ${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

function Cie10Select({
  value,
  onChange,
}: {
  value?: FuripsDiagnostico | null
  onChange?: (value: FuripsDiagnostico | null) => void
}) {
  const [term, setTerm] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setSearch(term.trim()), 300)
    return () => clearTimeout(timer)
  }, [term])

  const { data = [], isFetching } = useSearchCie10(search)
  const options = useMemo(() => {
    const list = data.map((c) => ({
      value: c.codigo,
      label: `${c.codigo} — ${c.descripcion}`,
      descripcion: c.descripcion,
    }))
    if (value?.codigo && !list.some((o) => o.value === value.codigo)) {
      list.unshift({
        value: value.codigo,
        label: `${value.codigo} — ${value.descripcion}`,
        descripcion: value.descripcion,
      })
    }
    return list
  }, [data, value])

  return (
    <Select
      allowClear
      showSearch
      filterOption={false}
      placeholder="Busque por código o descripción"
      loading={isFetching}
      value={value?.codigo ?? undefined}
      onSearch={setTerm}
      notFoundContent={search.length === 1 ? "Escriba al menos 2 caracteres" : "Sin resultados"}
      options={options}
      onChange={(codigo?: string) => {
        const option = options.find((o) => o.value === codigo)
        onChange?.(option ? { codigo: option.value, descripcion: option.descripcion } : null)
      }}
    />
  )
}

const withCurrentInsurer = (
  options: { value: string; label: string; name: string }[],
  code?: string | null,
  name?: string | null,
) => {
  const list = [...options]
  if (!list.some((o) => o.value === FURIPS_ADRES.codigo)) {
    list.unshift({
      value: FURIPS_ADRES.codigo,
      label: `${FURIPS_ADRES.codigo} — ${FURIPS_ADRES.nombre}`,
      name: FURIPS_ADRES.nombre,
    })
  }
  if (code && !list.some((o) => o.value === code)) {
    list.unshift({ value: code, label: `${code} — ${name ?? ""}`, name: name ?? "" })
  }
  return list
}
