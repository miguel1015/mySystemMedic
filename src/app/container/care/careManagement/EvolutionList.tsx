"use client"

import { DeleteOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons"
import { Button, Card, Empty, Modal as AntModal, Space, Tag, Tooltip, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useDeleteEvolucion } from "@/core/hooks/care/evoluciones/useDeleteEvolucion"
import { useDeleteEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useDeleteEvolucionEspecialista"
import type { ClinicalRecordAudit } from "@/core/interfaces/care/clinicalHistory"
import { formatDateTime } from "@/core/utils/date"
import { EvolucionDetailView } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolucionDetailView"
import { EvolucionEspecialistaDetailView } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolucionEspecialistaDetailView"
import { RECORD_TYPE_LABEL, type EvolutionEntry, type SpecialtyGroup } from "./clinicalHistory.utils"

interface Props {
  group: SpecialtyGroup
  admissionId: number
  // Con la admisión cerrada (facturada) solo se consulta.
  closed: boolean
  audits: ClinicalRecordAudit[]
  onEdit: (entry: EvolutionEntry) => void
  onChanged: () => void
  messageApi: MessageInstance
}

const CLOSED_HINT = "La admisión está cerrada (facturada): no se pueden modificar ni eliminar evoluciones."

// Evoluciones de una especialidad, una por tarjeta y en orden cronológico.
export default function EvolutionList({
  group,
  admissionId,
  closed,
  audits,
  onEdit,
  onChanged,
  messageApi,
}: Props) {
  const deleteEvolucion = useDeleteEvolucion()
  const deleteEvolucionEspecialista = useDeleteEvolucionEspecialista()

  const handleDelete = (entry: EvolutionEntry) => {
    const label = RECORD_TYPE_LABEL[entry.tipo]
    AntModal.confirm({
      title: `Eliminar ${label.toLowerCase()}`,
      content: `¿Confirma eliminar la ${label.toLowerCase()} del ${entry.data.fechaEvolucion} ${entry.data.horaEvolucion?.slice(0, 5)} registrada por ${entry.data.nombreProfesional}? Quedará registro de la eliminación.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const variables = { id: entry.data.id, admissionId }
          if (entry.tipo === "Evolucion") await deleteEvolucion.mutateAsync(variables)
          else await deleteEvolucionEspecialista.mutateAsync(variables)
          messageApi.success(`${label} eliminada correctamente`)
          onChanged()
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la evolución.")
        }
      },
    })
  }

  if (group.entries.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin evoluciones para esta especialidad" />
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {group.entries.map((entry, index) => {
        const changes = audits.filter(
          (a) => a.tipoRegistro === entry.tipo && a.registroId === entry.data.id,
        )
        const lastChange = changes[0]
        return (
          <Card
            key={`${entry.tipo}-${entry.data.id}`}
            size="small"
            title={
              <Space wrap size={6}>
                <Typography.Text strong>
                  #{index + 1} · {entry.data.fechaEvolucion} {entry.data.horaEvolucion?.slice(0, 5)}
                </Typography.Text>
                <Tag>{RECORD_TYPE_LABEL[entry.tipo]}</Tag>
                <Typography.Text type="secondary">{entry.data.nombreProfesional}</Typography.Text>
                {lastChange && (
                  <Tooltip
                    title={`Modificada ${changes.length} ${changes.length === 1 ? "vez" : "veces"}. Última: ${lastChange.nombreUsuario}, ${formatDateTime(lastChange.fechaAccion)}`}
                  >
                    <Tag icon={<HistoryOutlined />} color="gold">
                      Modificada
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            }
            extra={
              <Space>
                <Tooltip title={closed ? CLOSED_HINT : undefined}>
                  <Button size="small" icon={<EditOutlined />} disabled={closed} onClick={() => onEdit(entry)}>
                    Modificar
                  </Button>
                </Tooltip>
                <Tooltip title={closed ? CLOSED_HINT : undefined}>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={closed}
                    onClick={() => handleDelete(entry)}
                  >
                    Eliminar
                  </Button>
                </Tooltip>
              </Space>
            }
          >
            {entry.tipo === "Evolucion" ? (
              <EvolucionDetailView data={entry.data} />
            ) : (
              <EvolucionEspecialistaDetailView data={entry.data} />
            )}
          </Card>
        )
      })}
    </div>
  )
}
