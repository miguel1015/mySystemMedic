"use client"

import GridContainer from "@/components/componentLayout"
import Input from "@/components/input"
import {
  Button,
  Divider,
  Input as AntdInput,
  Radio,
  Spin,
} from "antd"
import {
  SearchOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ClearOutlined,
  SaveOutlined,
  FileSearchOutlined,
} from "@ant-design/icons"
import { useController, Control } from "react-hook-form"
import { useTriageForm, type TriageFormValues } from "./useTriageForm"

const { TextArea } = AntdInput

/* ── Estilos ── */

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border-subtle, #f0f0f3)",
  borderRadius: 10,
  padding: "20px 24px",
  marginBottom: 20,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--theme-primary, #0F6F5C)",
  marginBottom: 4,
  marginTop: 0,
  display: "flex",
  alignItems: "center",
  gap: 8,
}

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "48px 24px",
  color: "var(--dash-text-tertiary, #9ca3af)",
  borderRadius: 10,
  border: "2px dashed var(--dash-border, #e5e7eb)",
  marginTop: 16,
}

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: "I - Resucitación", color: "#ff4d4f" },
  2: { label: "II - Emergencia", color: "#fa8c16" },
  3: { label: "III - Urgencia", color: "#fadb14" },
  4: { label: "IV - Menos urgente", color: "#52c41a" },
  5: { label: "V - No urgente", color: "#1890ff" },
}

/* ── Componente principal ── */

export default function TriageForm() {
  const {
    control,
    handleSubmit,
    onSubmit,
    handleReset,
    patient,
    searchDoc,
    setSearchDoc,
    searchError,
    searching,
    handleSearchPatient,
  } = useTriageForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ── BÚSQUEDA DE PACIENTE ── */}
      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          <FileSearchOutlined />
          Búsqueda de Paciente
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />

        <div style={{ display: "flex", gap: 8, maxWidth: 480 }}>
          <AntdInput
            placeholder="Número de documento"
            prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault()
              handleSearchPatient()
            }}
            size="large"
            style={{ borderRadius: 8 }}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleSearchPatient}
            loading={searching}
            icon={<SearchOutlined />}
          >
            Buscar
          </Button>
        </div>

        {searchError && (
          <div style={{ color: "#ff4d4f", fontSize: 13, marginTop: 10 }}>
            {searchError}
          </div>
        )}
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!patient && !searching && (
        <div style={emptyStateStyle}>
          <UserOutlined style={{ fontSize: 40, color: "var(--dash-text-tertiary, #9ca3af)", marginBottom: 12 }} />
          <p style={{ fontSize: 15, margin: 0, color: "var(--dash-text-tertiary, #9ca3af)" }}>
            Ingrese un número de documento y presione <strong>Buscar</strong> para
            comenzar el registro de triage.
          </p>
        </div>
      )}

      {/* ── DATOS DEL PACIENTE (Solo lectura) ── */}
      {patient && (
        <>
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <UserOutlined />
              Datos del Paciente
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer columns="col-4" gap="g-3">
              <Input
                name="firstName"
                label="Primer Nombre"
                control={control}
                disabled
              />
              <Input
                name="secondName"
                label="Segundo Nombre"
                control={control}
                disabled
              />
              <Input
                name="firstLastName"
                label="Primer Apellido"
                control={control}
                disabled
              />
              <Input
                name="secondLastName"
                label="Segundo Apellido"
                control={control}
                disabled
              />
              <Input
                type="date"
                name="birthDate"
                label="Fecha de Nacimiento"
                control={control}
                disabled
              />
              <Input
                name="gender"
                label="Sexo"
                control={control}
                disabled
              />
            </GridContainer>
          </div>

          {/* ── TRIAGE ── */}
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <MedicineBoxOutlined />
              Triage
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer gap="g-3">
              <Input
                type="datetime-local"
                name="dateTime"
                label="Fecha y Hora"
                control={control}
              />
            </GridContainer>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                Prioridad
              </label>
              <PrioritySelector control={control} />
            </div>

            <ConsultationReasonField control={control} />
          </div>

          {/* ── SIGNOS VITALES ── */}
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <HeartOutlined />
              Signos Vitales
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer columns="col-4" gap="g-3">
              <Input
                name="bloodPressure"
                label="Tensión Arterial"
                placeholder="Ej: 120/80"
                control={control}
              />
              <Input
                type="number"
                name="heartRate"
                label="Frecuencia Cardiaca (lpm)"
                placeholder="Ej: 72"
                control={control}
              />
              <Input
                type="number"
                name="respiratoryRate"
                label="Frecuencia Respiratoria (rpm)"
                placeholder="Ej: 18"
                control={control}
              />
              <Input
                type="number"
                name="weight"
                label="Peso (kg)"
                placeholder="Ej: 70"
                control={control}
              />
              <Input
                type="number"
                name="height"
                label="Talla (cm)"
                placeholder="Ej: 170"
                control={control}
              />
              <Input
                type="number"
                name="temperature"
                label="Temperatura (°C)"
                placeholder="Ej: 36.5"
                control={control}
              />
              <Input
                type="number"
                name="glasgow"
                label="Glasgow (3-15)"
                placeholder="Ej: 15"
                control={control}
              />
            </GridContainer>
          </div>

          {/* ── BOTONES ── */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<ClearOutlined />} onClick={handleReset}>
              Limpiar
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Guardar Triage
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

/* ── Componente de selección de prioridad ── */

function PrioritySelector({ control }: { control: Control<TriageFormValues> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "priority", control })

  return (
    <div>
      <Radio.Group
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = field.value === level
          return (
            <Radio.Button
              key={level}
              value={level}
              style={{
                borderColor: isSelected ? priorityLabels[level].color : undefined,
                color: isSelected ? "#fff" : priorityLabels[level].color,
                background: isSelected ? priorityLabels[level].color : undefined,
                fontWeight: 600,
                minWidth: 160,
                textAlign: "center",
                height: 36,
                lineHeight: "34px",
              }}
            >
              {priorityLabels[level].label}
            </Radio.Button>
          )
        })}
      </Radio.Group>
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  )
}

/* ── Componente de motivo de consulta (TextArea) ── */

function ConsultationReasonField({ control }: { control: Control<TriageFormValues> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "consultationReason", control })

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 4,
          fontWeight: 500,
        }}
      >
        Motivo de Consulta
      </label>
      <TextArea
        {...field}
        rows={3}
        placeholder="Describa el motivo de consulta del paciente..."
        status={error ? "error" : undefined}
        value={field.value ?? ""}
        style={{ borderRadius: 6 }}
      />
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  )
}
