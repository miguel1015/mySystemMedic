"use client"

import GridContainer from "@/components/componentLayout"
import Input from "@/components/input"
import SelectAutocomplete from "@/components/select"
import {
  Button,
  Divider,
  Input as AntdInput,
  Spin,
} from "antd"
import {
  SearchOutlined,
  UserOutlined,
  SolutionOutlined,
  ClearOutlined,
  SaveOutlined,
  FileSearchOutlined,
} from "@ant-design/icons"
import { useAdmissionForm } from "./useAdmissionForm"

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

/* ── Componente principal ── */

export default function AdmissionsForm() {
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
    isLoadingCatalogs,
    hasServiceClassification,
    careModalityOptions,
    careReasonOptions,
    serviceClassificationOptions,
    serviceGroupOptions,
    admissionTypeOptions,
    careScopeOptions,
    carePurposeOptions,
    insurerOptions,
    agreementOptions,
  } = useAdmissionForm()

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
            comenzar el proceso de admisión.
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

          {/* ── INFORMACIÓN DE ADMISIÓN ── */}
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <SolutionOutlined />
              Información de Admisión
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer columns="col-3" gap="g-3">
              <SelectAutocomplete
                name="careModality"
                label="Modalidad de atención"
                placeholder="Seleccione"
                control={control}
                options={careModalityOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="careReason"
                label="Motivo de atención"
                placeholder="Seleccione"
                control={control}
                options={careReasonOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="serviceClassification"
                label="Clasificación del servicio"
                placeholder="Seleccione"
                control={control}
                options={serviceClassificationOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="serviceGroup"
                label="Grupo servicio"
                placeholder={
                  hasServiceClassification
                    ? "Seleccione"
                    : "Seleccione una clasificación primero"
                }
                control={control}
                options={serviceGroupOptions}
                loading={isLoadingCatalogs}
                disabled={!hasServiceClassification}
              />
              <SelectAutocomplete
                name="admissionType"
                label="Ingreso"
                placeholder="Seleccione"
                control={control}
                options={admissionTypeOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="careScope"
                label="Ámbito de la atención"
                placeholder="Seleccione"
                control={control}
                options={careScopeOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="carePurpose"
                label="Finalidad de la atención"
                placeholder="Seleccione"
                control={control}
                options={carePurposeOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="insurerId"
                label="EPS / Aseguradora"
                placeholder="Seleccione"
                control={control}
                options={insurerOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="agreementId"
                label="Convenio"
                placeholder="Seleccione"
                control={control}
                options={agreementOptions}
                loading={isLoadingCatalogs}
              />
            </GridContainer>
          </div>

          {/* ── BOTONES ── */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<ClearOutlined />} onClick={handleReset}>
              Limpiar
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Guardar Admisión
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
