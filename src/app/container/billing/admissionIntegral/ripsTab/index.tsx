"use client"

import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { BillingMovementResponse } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons"
import { Alert, Button, Descriptions, Empty, Skeleton, Tag } from "antd"
import { useEffect, useMemo, useState } from "react"
import { formatDate, formatDateTime } from "../utils"
import { RipsValidationResult, validateRips } from "./validateRips"

export type { RipsValidationResult }

interface RipsTabProps {
  admission: AdmissionResponse | undefined
  admissionId: string
  movements: BillingMovementResponse[]
  onValidationChange: (result: RipsValidationResult | null) => void
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 10,
  padding: "18px 20px",
  marginBottom: 20,
}

const RipsTab = ({ admission, admissionId, movements, onValidationChange }: RipsTabProps) => {
  const { data: hcInicial, isLoading: isLoadingHc } = useGetHCInicialByAdmission(admissionId)
  const { data: dischargeRecords = [], isLoading: isLoadingDischarge } =
    useGetDatosClinicosEgresoByAdmission(admissionId)

  const activeDischarge = useMemo(
    () => dischargeRecords.find((record) => record.isActive) ?? dischargeRecords[0] ?? null,
    [dischargeRecords],
  )

  const { data: diagnosticosEgresoData, isLoading: isLoadingDiagnosticosEgreso } =
    useGetDiagnosticosEgresoByIds([activeDischarge?.diagnosticoEgresoId])

  const diagnosticoEgreso = diagnosticosEgresoData[0] ?? null
  const diagnosticosIngreso = hcInicial?.analisisDiagnosticosPlan?.diagnosticos ?? []

  const [validation, setValidation] = useState<RipsValidationResult | null>(null)

  useEffect(() => {
    onValidationChange(validation)
  }, [validation, onValidationChange])

  const isLoading = isLoadingHc || isLoadingDischarge || isLoadingDiagnosticosEgreso

  const handleValidate = () => {
    const result = validateRips({
      admission,
      diagnosticosIngreso,
      diagnosticoEgreso,
      movements,
    })
    setValidation(result)
  }

  if (!admission) {
    return <Skeleton active paragraph={{ rows: 4 }} />
  }

  return (
    <div>
      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Información de admisión</h6>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          items={[
            { key: "admissionId", label: "Número de admisión", children: `#${admission.id}` },
            {
              key: "document",
              label: "Documento del paciente",
              children: `${admission.documentTypeCode} ${admission.documentoPatiente}`,
            },
            { key: "patientName", label: "Nombre completo", children: admission.nombrePaciente },
            {
              key: "admissionDate",
              label: "Fecha y hora de admisión",
              children: formatDateTime(admission.admissionDate),
            },
            {
              key: "dischargeDate",
              label: "Fecha de egreso",
              children: diagnosticoEgreso?.fechaEgreso
                ? formatDate(diagnosticoEgreso.fechaEgreso)
                : "Sin egreso registrado",
            },
            {
              key: "contract",
              label: "Contrato / convenio",
              children: admission.convenioNombre || "Sin convenio",
            },
          ]}
        />
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Diagnósticos de ingreso</h6>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : diagnosticosIngreso.length === 0 ? (
          <Empty description="No hay diagnósticos de ingreso registrados en la historia clínica inicial." />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {diagnosticosIngreso.map((diagnostico) => (
              <Tag key={diagnostico.id} color="blue" style={{ padding: "4px 10px" }}>
                {diagnostico.codigo} — {diagnostico.descripcion}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Diagnósticos de egreso</h6>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : !diagnosticoEgreso ? (
          <Empty description="No hay diagnóstico de egreso registrado para esta admisión." />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tag color="orange" style={{ padding: "4px 10px" }}>
              {diagnosticoEgreso.codigoDiagnosticoEgreso1} — {diagnosticoEgreso.descripcionDiagnosticoEgreso1}
            </Tag>
            {diagnosticoEgreso.codigoDiagnosticoEgreso2 && (
              <Tag color="orange" style={{ padding: "4px 10px" }}>
                {diagnosticoEgreso.codigoDiagnosticoEgreso2} — {diagnosticoEgreso.descripcionDiagnosticoEgreso2}
              </Tag>
            )}
            {diagnosticoEgreso.codigoDiagnosticoEgreso3 && (
              <Tag color="orange" style={{ padding: "4px 10px" }}>
                {diagnosticoEgreso.codigoDiagnosticoEgreso3} — {diagnosticoEgreso.descripcionDiagnosticoEgreso3}
              </Tag>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Button
          type="primary"
          size="large"
          icon={<SafetyCertificateOutlined />}
          onClick={handleValidate}
          disabled={isLoading}
          style={{ alignSelf: "flex-start" }}
        >
          Validar RIPS
        </Button>

        {validation && validation.isValid && (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="Información válida para RIPS"
            description="La admisión cumple las validaciones de completitud requeridas para continuar con el proceso de facturación."
          />
        )}

        {validation && !validation.isValid && (
          <Alert
            type="error"
            showIcon
            message="Se encontraron inconsistencias en la información de RIPS"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {validation.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            }
          />
        )}
      </div>
    </div>
  )
}

export default RipsTab
