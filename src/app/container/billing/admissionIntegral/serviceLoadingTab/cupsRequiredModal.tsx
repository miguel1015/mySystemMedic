"use client"

import CupsPicker, { CupsOption } from "@/app/container/parameterization/cupsHomologation/cupsPicker"
import Modal from "@/components/modal"
import {
  ripsTypeForServiceCategory,
  useUpdateCupsHomologation,
} from "@/core/hooks/parameterization/cups/useCups"
import { Alert, Button, Space } from "antd"
import { useEffect, useState } from "react"

export interface CupsRequiredItem {
  referenceCode: number
  description: string
  serviceCategory: string | null
}

interface CupsRequiredModalProps {
  item: CupsRequiredItem | null
  onCancel: () => void
  // Se llama cuando el CUPS quedó guardado en el detalle de tarifa.
  onAssigned: (cupsCode: string) => void
}

// Se muestra al cargar un servicio cuya tarifa no tiene CUPS: el RIPS lo exige, así que se
// homologa en ese momento y queda guardado para todos los tarifarios que usan el código.
export default function CupsRequiredModal({ item, onCancel, onAssigned }: CupsRequiredModalProps) {
  const [value, setValue] = useState<CupsOption | null>(null)
  const update = useUpdateCupsHomologation()

  useEffect(() => {
    setValue(null)
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const handleAssign = () => {
    if (!item || !value) return
    update.mutate(
      { referenceCode: item.referenceCode, cupsCode: value.code },
      { onSuccess: (res) => onAssigned(res.cupsCode ?? value.code) },
    )
  }

  return (
    <Modal
      open={!!item}
      onClose={onCancel}
      size="md"
      title="Asignar código CUPS"
      footer={
        <Space>
          <Button onClick={onCancel} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button type="primary" onClick={handleAssign} disabled={!value} loading={update.isPending}>
            Asignar y continuar
          </Button>
        </Space>
      }
    >
      {item && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0 }}>
            El servicio <strong>{item.description}</strong> (código tarifario{" "}
            <span style={{ fontFamily: "monospace" }}>{item.referenceCode}</span>) no tiene código
            CUPS, que es obligatorio en el RIPS. Elíjalo para continuar: quedará guardado para las
            próximas veces.
          </p>
          <CupsPicker
            description={item.description}
            type={ripsTypeForServiceCategory(item.serviceCategory)}
            value={value}
            onChange={setValue}
          />
          <small style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
            Las sugerencias comparan descripciones; verifique que el CUPS corresponda al servicio
            prestado.
          </small>
          {update.isError && (
            <Alert type="error" showIcon title="No se pudo asignar el CUPS" description={update.error.message} />
          )}
        </div>
      )}
    </Modal>
  )
}
