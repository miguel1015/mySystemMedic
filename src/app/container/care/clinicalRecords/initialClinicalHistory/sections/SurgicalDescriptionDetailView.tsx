"use client"

import { Descriptions, Skeleton, Typography } from "antd"
import { useEffect, useState } from "react"
import type { DescripcionQuirurgicaResponse } from "@/core/interfaces/care/hciInicial"
import { resolveDiagnosisDescription, resolveProcedureDescription } from "./qxCodeResolvers"

interface Props {
  data: DescripcionQuirurgicaResponse
}

const formatDateTime = (value: string) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const SurgicalDescriptionDetailView = ({ data }: Props) => {
  const [resolvingCodes, setResolvingCodes] = useState(true)
  const [procedures, setProcedures] = useState<{ code: string; description: string }[]>([])
  const [diagnoses, setDiagnoses] = useState<{ code: string; description: string }[]>([])

  useEffect(() => {
    let cancelled = false

    const procedureCodes = [data.procedimiento1, data.procedimiento2, data.procedimiento3, data.procedimiento4]
      .filter((c): c is string => !!c)
    const diagnosisCodes = [data.diagnostico1, data.diagnostico2, data.diagnostico3, data.diagnostico4]
      .filter((c): c is string => !!c)

    setResolvingCodes(true)
    Promise.all([
      Promise.all(procedureCodes.map(resolveProcedureDescription)),
      Promise.all(diagnosisCodes.map(resolveDiagnosisDescription)),
    ]).then(([procedureDescriptions, diagnosisDescriptions]) => {
      if (cancelled) return
      setProcedures(procedureCodes.map((code, idx) => ({ code, description: procedureDescriptions[idx] })))
      setDiagnoses(diagnosisCodes.map((code, idx) => ({ code, description: diagnosisDescriptions[idx] })))
      setResolvingCodes(false)
    })

    return () => {
      cancelled = true
    }
  }, [data])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Fecha inicial de ejecución">{formatDateTime(data.fechaHoraInicio)}</Descriptions.Item>
        <Descriptions.Item label="Fecha final de ejecución">{formatDateTime(data.fechaHoraFinalizacion)}</Descriptions.Item>
        <Descriptions.Item label="Cirujano">{data.nombreCirujano || "—"}</Descriptions.Item>
        <Descriptions.Item label="Anestesiólogo">{data.nombreAnestesiologo || "—"}</Descriptions.Item>
        <Descriptions.Item label="Instrumentador">{data.nombreInstrumentador || "—"}</Descriptions.Item>
        <Descriptions.Item label="Ayudante Qx">{data.nombreAyudanteQx || "—"}</Descriptions.Item>
        <Descriptions.Item label="Tipo de anestesia" span={2}>{data.nombreTipoAnestesia || "—"}</Descriptions.Item>
      </Descriptions>

      {resolvingCodes ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <>
          <div>
            <Typography.Text strong>Procedimientos (CUPS/SOAT)</Typography.Text>
            {procedures.length ? (
              <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {procedures.map((p, idx) => (
                  <li key={`${p.code}-${idx}`}>
                    {idx === 0 ? "Principal" : `Procedimiento ${idx + 1}`}: {p.code} - {p.description || "—"}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 4 }}>—</p>
            )}
          </div>

          <div>
            <Typography.Text strong>Diagnósticos de ingreso (CIE-10)</Typography.Text>
            {diagnoses.length ? (
              <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {diagnoses.map((d, idx) => (
                  <li key={`${d.code}-${idx}`}>
                    {idx === 0 ? "Principal" : `Diagnóstico ${idx + 1}`}: {d.code} - {d.description || "—"}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 4 }}>—</p>
            )}
          </div>
        </>
      )}

      <div>
        <Typography.Text strong>Descripción del procedimiento</Typography.Text>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.descripcionProcedimiento || "—"}</p>
      </div>
    </div>
  )
}
