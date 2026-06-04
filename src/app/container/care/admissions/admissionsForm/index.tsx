"use client"

import GridContainer from "@/components/componentLayout"
import SelectAutocomplete from "@/components/select"
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Input as AntdInput,
  Spin,
  Tag,
} from "antd"
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClearOutlined,
  FileSearchOutlined,
  ManOutlined,
  SaveOutlined,
  SearchOutlined,
  SolutionOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons"
import { useAdmissionForm } from "./useAdmissionForm"
import {
  AdmissionResponse,
  PatientMiniResponse,
} from "@/core/interfaces/care/types"
import AdmissionsFormSkeleton from "./admissionsFormSkeleton"

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

interface AdmissionsFormProps {
  initialAdmission?: AdmissionResponse | null
  onDone?: () => void
}

export default function AdmissionsForm({
  initialAdmission = null,
  onDone,
}: AdmissionsFormProps) {
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
    isEdit,
    isSubmitting,
    isLoadingCatalogs,
    isEditDataReady,
    hasServiceClassification,
    hasSelectedInsurer,
    careModalityOptions,
    careReasonOptions,
    serviceClassificationOptions,
    serviceGroupOptions,
    admissionTypeOptions,
    careScopeOptions,
    carePurposeOptions,
    insurerOptions,
    agreementOptions,
    handleAgreementChange,
    handleAgreementClear,
  } = useAdmissionForm({ initialAdmission, onDone })

  const showFormBody = isEdit || !!patient

  if (isEdit && !isEditDataReady) {
    return <AdmissionsFormSkeleton />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          {isEdit ? <UserOutlined /> : <FileSearchOutlined />}
          {isEdit ? "Paciente" : "Busqueda de Paciente"}
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />

        {isEdit && initialAdmission ? (
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--dash-text-tertiary, #9ca3af)",
                }}
              >
                Documento
              </div>
              <div style={{ fontWeight: 600, fontFamily: "monospace" }}>
                {initialAdmission.documentoPatiente}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--dash-text-tertiary, #9ca3af)",
                }}
              >
                Paciente
              </div>
              <div style={{ fontWeight: 600 }}>
                {initialAdmission.nombrePaciente}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, maxWidth: 480 }}>
            <AntdInput
              placeholder="Numero de documento"
              prefix={
                <SearchOutlined
                  style={{ color: "var(--theme-primary, #0F6F5C)" }}
                />
              }
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
        )}

        {searchError && (
          <Alert
            style={{ marginTop: 12 }}
            type={searchError.type === "not-found" ? "warning" : "error"}
            showIcon
            title={
              searchError.type === "not-found"
                ? "Paciente no encontrado"
                : "No se pudo realizar la busqueda"
            }
            description={
              searchError.type === "not-found" ? (
                <>
                  {searchError.message} Verifica el numero o{" "}
                  <strong>registralo desde el modulo de Pacientes</strong>{" "}
                  antes de continuar con la admision.
                </>
              ) : (
                searchError.message
              )
            }
          />
        )}

        {patient && <PatientCard patient={patient} />}
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      )}

      {!showFormBody && !searching && (
        <div style={emptyStateStyle}>
          <UserOutlined
            style={{
              fontSize: 40,
              color: "var(--dash-text-tertiary, #9ca3af)",
              marginBottom: 12,
            }}
          />
          <p
            style={{
              fontSize: 15,
              margin: 0,
              color: "var(--dash-text-tertiary, #9ca3af)",
            }}
          >
            Ingrese un numero de documento y presione <strong>Buscar</strong>{" "}
            para comenzar el proceso de admision.
          </p>
        </div>
      )}

      {showFormBody && (
        <>
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <SolutionOutlined />
              Informacion de Admision
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer columns="col-4" gap="g-4">
              <SelectAutocomplete
                name="careModality"
                label="Modalidad de atencion"
                placeholder="Seleccione"
                control={control}
                options={careModalityOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="careReason"
                label="Motivo de atencion"
                placeholder="Seleccione"
                control={control}
                options={careReasonOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="serviceClassification"
                label="Clasificacion del servicio"
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
                    : "Seleccione una clasificacion primero"
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
                label="Ambito de la atencion"
                placeholder="Seleccione"
                control={control}
                options={careScopeOptions}
                loading={isLoadingCatalogs}
              />
              <SelectAutocomplete
                name="carePurpose"
                label="Finalidad de la atencion"
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
                placeholder={
                  hasSelectedInsurer ? "Seleccione" : "Seleccione una EPS primero"
                }
                control={control}
                options={agreementOptions}
                loading={isLoadingCatalogs}
                disabled={!hasSelectedInsurer}
                onChange={handleAgreementChange}
                onClear={handleAgreementClear}
              />
            </GridContainer>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<ClearOutlined />} onClick={isEdit ? onDone : handleReset}>
              {isEdit ? "Cancelar" : "Limpiar"}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEdit ? "Actualizar Admision" : "Guardar Admision"}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

function calculateAge(birthDate: string): number | null {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

function getSexIcon(sexo?: string | null) {
  if (!sexo) return <UserOutlined />
  const normalized = sexo.toLowerCase()
  if (normalized.startsWith("f") || normalized.includes("mujer")) {
    return <WomanOutlined />
  }
  if (normalized.startsWith("m") || normalized.includes("hombre")) {
    return <ManOutlined />
  }
  return <UserOutlined />
}

function PatientCard({ patient }: { patient: PatientMiniResponse }) {
  const fullName = [
    patient.primerNombre,
    patient.segundoNombre,
    patient.primerApellido,
    patient.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")

  const initials = [patient.primerNombre, patient.primerApellido]
    .filter(Boolean)
    .map((name) => name!.charAt(0).toUpperCase())
    .join("")

  const age = patient.fechaNacimiento
    ? calculateAge(patient.fechaNacimiento)
    : null

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(82, 196, 26, 0.35)",
        background:
          "linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(15, 111, 92, 0.04) 100%)",
        borderLeft: "4px solid #52c41a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
          color: "#389e0d",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        <CheckCircleFilled />
        Paciente encontrado
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          size={64}
          style={{
            background: "var(--theme-primary, #0F6F5C)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials || <UserOutlined />}
        </Avatar>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--dash-text-primary, #111827)",
              marginBottom: 4,
            }}
          >
            {fullName}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag color="success" style={{ margin: 0 }}>
              Activo
            </Tag>
            {age !== null && (
              <Tag color="blue" style={{ margin: 0 }}>
                {age} {age === 1 ? "ano" : "anos"}
              </Tag>
            )}
            {patient.sexo && (
              <Tag
                color="geekblue"
                icon={getSexIcon(patient.sexo)}
                style={{ margin: 0 }}
              >
                {patient.sexo}
              </Tag>
            )}
            {patient.fechaNacimiento && (
              <Tag icon={<CalendarOutlined />} style={{ margin: 0 }}>
                {new Date(patient.fechaNacimiento).toLocaleDateString()}
              </Tag>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
