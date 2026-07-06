"use client"

import { ArrowLeftOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, message, Modal, Skeleton, Tag, Tooltip } from "antd"
import { useEffect, useMemo, useState } from "react"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useHCInicialHistoryByPatient } from "@/core/hooks/care/hciInicial/useHCInicialHistoryByPatient"
import { useDeleteHCInicial } from "@/core/hooks/care/hciInicial/useSaveHCInicial"
import { HciInicialEditPanel } from "./HciInicialEditPanel"
import { HciInicialOverview } from "./HciInicialOverview"

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

export const HciInicialHistoryList = ({ patientId, admissionId }: Props) => {
  const { records, isLoading } = useHCInicialHistoryByPatient(patientId)
  const { data: me } = useMe()
  const [messageApi, contextHolder] = message.useMessage()
  const deleteHCInicial = useDeleteHCInicial()
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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleDelete = (record: (typeof records)[number]) => {
    Modal.confirm({
      title: "Eliminar historia clínica inicial",
      content: `Esta acción eliminará del histórico la historia clínica inicial de la admisión #${record.admission.id}. Esta acción no se puede deshacer. ¿Desea continuar?`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteHCInicial.mutateAsync({
            id: record.hcInicial.id,
            admissionId: record.admission.id,
          })
          messageApi.success("Historia clínica inicial eliminada del histórico.")
          setSelectedAdmissionId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la historia clínica inicial.")
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
          {records.map(({ admission, hcInicial }) => {
            const isCurrentlyClosed = hcInicial.isClosed === true
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
                    <Tag color={isCurrentlyClosed ? "default" : "green"} style={{ margin: 0 }}>
                      {isCurrentlyClosed ? "Clausurada" : "Activa"}
                    </Tag>
                  </div>
                  <div className="chrm-item-author">
                    <UserOutlined /> {me?.name ?? "Usuario"}
                  </div>
                  <p className="chrm-item-excerpt">
                    Admisión #{admission.id} · {admission.careScopeName || admission.serviceGroupName || "Sin servicio"}
                  </p>
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
                  handleCancelEdit()
                  return
                }
                setSelectedAdmissionId(null)
              }}
            >
              ← {isEditing ? "Volver al detalle" : "Volver al listado"}
            </button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              {isEditing ? (
                <Button icon={<ArrowLeftOutlined />} onClick={handleCancelEdit}>
                  Cancelar edición
                </Button>
              ) : (
                <>
                  <Button icon={<EditOutlined />} onClick={handleEdit}>
                    Editar
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    loading={deleteHCInicial.isPending}
                    onClick={() => handleDelete(selected)}
                  >
                    Eliminar
                  </Button>
                </>
              )}
            </div>
            {isEditing ? (
              <HciInicialEditPanel
                admissionId={selected.admission.id}
                patientName={selected.hcInicial.nombrePaciente || "Paciente"}
                messageApi={messageApi}
              />
            ) : (
              <HciInicialOverview admissionId={selected.admission.id} />
            )}
          </>
        ) : (
          <div className="chrm-detail-empty">
            <Empty description="Selecciona una historia del listado para ver el detalle." />
          </div>
        )}
      </div>
    </div>
  )
}
