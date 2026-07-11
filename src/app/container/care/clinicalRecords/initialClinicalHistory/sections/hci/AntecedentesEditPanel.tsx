"use client"

import { SaveOutlined } from "@ant-design/icons"
import { Button, Input, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { useUpdateObjetivoHCInicial } from "@/core/hooks/care/hciInicial/useSaveObjetivo"
import { antecedentesFields, defaultAntecedentes, labelStyle } from "../../constants"
import type { AntecedentesState } from "../../types"

interface Props {
  admissionId: string | number
  messageApi: MessageInstance
  onSaved: () => void
  onCancel: () => void
}

export const AntecedentesEditPanel = ({ admissionId, messageApi, onSaved, onCancel }: Props) => {
  const { data: hcInicial, isLoading, refetch } = useGetHCInicialByAdmission(admissionId)
  const updateObjetivo = useUpdateObjetivoHCInicial()

  const [antecedentes, setAntecedentes] = useState<AntecedentesState>(defaultAntecedentes)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!hcInicial?.objetivo || hydrated) return
    const o = hcInicial.objetivo
    setAntecedentes({
      padres: o.padres ?? "",
      personalesMedicos: o.personalesMedicos ?? "",
      otrosFamiliares: o.otrosFamiliares ?? "",
      alergicos: o.alergicos ?? "",
      quirurgicos: o.quirurgicos ?? "",
      toxicos: o.toxicos ?? "",
      transfusiones: o.transfusiones ?? "",
      habitos: o.habitos ?? "",
      traumas: o.traumas ?? "",
    })
    setHydrated(true)
  }, [hcInicial, hydrated])

  if (isLoading || !hydrated) {
    return <Skeleton active paragraph={{ rows: 6 }} />
  }

  if (!hcInicial?.objetivo) {
    return (
      <p className="chrm-detail-field-value">
        Esta admisión aún no tiene un registro de Objetivo/Antecedentes creado.
      </p>
    )
  }

  const handleSave = async () => {
    const missing = antecedentesFields.some(({ key }) => !antecedentes[key]?.trim())
    if (missing) {
      messageApi.error("Todos los campos de antecedentes son obligatorios.")
      return
    }

    const o = hcInicial.objetivo!
    try {
      await updateObjetivo.mutateAsync({
        id: o.id,
        data: {
          cabezaCuello: o.cabezaCuello,
          torax: o.torax,
          abdomen: o.abdomen,
          extremidades: o.extremidades,
          sistemaNervioso: o.sistemaNervioso,
          organosSentidos: o.organosSentidos,
          genitourinario: o.genitourinario,
          ...antecedentes,
          isActive: true,
        },
      })
      messageApi.success("Antecedentes actualizados correctamente.")
      await refetch()
      onSaved()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudieron actualizar los antecedentes.")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12 }}>
        {antecedentesFields.map(({ key, label }) => (
          <div key={key}>
            <label style={labelStyle}>
              {label} <span className="field-required">*</span>
            </label>
            <Input
              value={antecedentes[key]}
              onChange={(e) => setAntecedentes({ ...antecedentes, [key]: e.target.value })}
              placeholder={`Ingrese ${label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="primary" icon={<SaveOutlined />} loading={updateObjetivo.isPending} onClick={handleSave}>
          Guardar antecedentes
        </Button>
      </div>
    </div>
  )
}
