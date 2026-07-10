"use client"

import { ArrowLeftOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, message, Modal, Skeleton, Tooltip } from "antd"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useHCInicialHistoryByPatient, type HCInicialHistoryRecord } from "@/core/hooks/care/hciInicial/useHCInicialHistoryByPatient"
import { useUpdateObjetivoHCInicial } from "@/core/hooks/care/hciInicial/useSaveObjetivo"
import { antecedentesFields } from "../../constants"
import { AntecedentesEditPanel } from "./AntecedentesEditPanel"
import { AntecedentesOverview } from "./AntecedentesOverview"

interface Props {
  patientId?: string | number
  admissionId?: string | number
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const buildExcerpt = (record: HCInicialHistoryRecord) => {
  const o = record.hcInicial.objetivo
  if (!o) return "Sin antecedentes registrados."
  const firstFilled = antecedentesFields.find(({ key }) => o[key]?.trim())
  if (!firstFilled) return "Antecedentes vacíos."
  return `${firstFilled.label}: ${o[firstFilled.key]}`
}

export const AntecedentesHistoryList = ({ patientId, admissionId }: Props) => {
  const { records, isLoading } = useHCInicialHistoryByPatient(patientId)
  const { data: me } = useMe()
  const [messageApi, contextHolder] = message.useMessage()
  const updateObjetivo = useUpdateObjetivoHCInicial()
  const queryClient = useQueryClient()
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const defaultSelectedId = useMemo(() => {
    if (!records.length) return null
    const current = admissionId
      ? records.find((record) => String(record.admission.id) === String(admissionId))
      : null
    return (current ?? records[0]).admission.id
  }, [records, admissionId])

  useEffect(() => {
    if (selectedAdmissionId == null && defaultSelectedId != null) {
      setSelectedAdmissionId(defaultSelectedId)
    }
  }, [defaultSelectedId, selectedAdmissionId])

  const selected = records.find((record) => record.admission.id === selectedAdmissionId) ?? null

  const handleDelete = (record: HCInicialHistoryRecord) => {
    if (!record.hcInicial.objetivo) return
    const o = record.hcInicial.objetivo
    Modal.confirm({
      title: "Eliminar antecedentes",
      content: `Esta acción borrará únicamente los antecedentes personales y familiares de la admisión #${record.admission.id}. El resto del registro (examen físico, subjetivo, signos vitales, etc.) no se modifica. ¿Desea continuar?`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
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
              padres: "",
              personalesMedicos: "",
              otrosFamiliares: "",
              alergicos: "",
              quirurgicos: "",
              toxicos: "",
              transfusiones: "",
              habitos: "",
              traumas: "",
              isActive: true,
            },
          })
          await queryClient.invalidateQueries({
            queryKey: ["hci-inicial", "by-admission", String(record.admission.id)],
          })
          messageApi.success("Antecedentes eliminados correctamente.")
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudieron eliminar los antecedentes.")
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="chrm-skeleton-wrap">
        {contextHolder}
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
        ))}
      </div>
    )
  }

  if (!records.length) {
    return (
      <div className="chrm-state-message">
        {contextHolder}
        <Empty description="Aún no hay historias clínicas iniciales registradas para este paciente." />
      </div>
    )
  }

  return (
    <div className={`chrm-body${selected ? " has-selection" : ""}${isEditing ? " is-editing" : ""}`}>
      {contextHolder}
      <div className="chrm-list">
        <ul className="chrm-timeline">
          {records.map((record) => {
            const { admission } = record
            return (
              <li key={admission.id}>
                <button
                  type="button"
                  className={`chrm-item${selectedAdmissionId === admission.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedAdmissionId(admission.id)
                    setIsEditing(false)
                  }}
                >
                  <div className="chrm-item-top">
                    <Tooltip title={formatDateTime(admission.createdAt)}>
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(admission.createdAt)}
                      </span>
                    </Tooltip>
                  </div>
                  <div className="chrm-item-author">
                    <UserOutlined /> {me?.name ?? "Usuario"}
                  </div>
                  <p className="chrm-item-excerpt">{buildExcerpt(record)}</p>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="chrm-detail">
        {selected ? (
          <>
            <button
              type="button"
              className="chrm-back-btn"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false)
                  return
                }
                setSelectedAdmissionId(null)
              }}
            >
              ← {isEditing ? "Volver al detalle" : "Volver al listado"}
            </button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              {isEditing ? (
                <Button icon={<ArrowLeftOutlined />} onClick={() => setIsEditing(false)}>
                  Cancelar edición
                </Button>
              ) : (
                <>
                  <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    disabled={!selected.hcInicial.objetivo}
                    loading={updateObjetivo.isPending}
                    onClick={() => handleDelete(selected)}
                  >
                    Eliminar
                  </Button>
                </>
              )}
            </div>
            {isEditing ? (
              <AntecedentesEditPanel
                admissionId={selected.admission.id}
                messageApi={messageApi}
                onSaved={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <AntecedentesOverview hcInicial={selected.hcInicial} />
            )}
          </>
        ) : (
          <div className="chrm-detail-empty">
            <Empty description="Selecciona una historia del listado para ver sus antecedentes." />
          </div>
        )}
      </div>
    </div>
  )
}
