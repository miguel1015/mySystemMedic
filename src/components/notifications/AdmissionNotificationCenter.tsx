"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Modal } from "antd"
import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  UserAddOutlined,
} from "@ant-design/icons"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import { TriageNotification } from "@/core/interfaces/care/triageNotifications"
import AdmissionNotificationCard from "./AdmissionNotificationCard"
import TriageNotificationCard from "./TriageNotificationCard"
import { isPending } from "./admissionNotificationUtils"
import { useThemeVars } from "./useThemeVars"

export type FolderKey = "urgent" | "pending" | "resolved" | "triage" | "triaged"

interface Folder {
  key: FolderKey
  label: string
  hint: string
  icon: ReactNode
  tone: "danger" | "warning" | "success" | "info"
  count: number
  // Carpeta con pendientes por atender (no las de "atendidas").
  actionable: boolean
  render: (now: number) => ReactNode[]
  empty: string
}

interface AdmissionNotificationCenterProps {
  open: boolean
  canReceiveAdmissions: boolean
  canReceiveTriage: boolean
  notifications: AdmissionNotification[]
  triageNotifications: TriageNotification[]
  onAdmit: (notification: AdmissionNotification) => void
  onTriage: (notification: TriageNotification) => void
  // Se abrió la carpeta de pacientes por triage: los nuevos pasan a vistos.
  onTriageFolderViewed: () => void
  onClose: () => void
}

// Centro de notificaciones con carpetas. Admisionistas: urgentes (I a III), pendientes (IV y
// V) y atendidas. Personal asistencial: pacientes nuevos por triage y triados. Las atendidas
// son las de las últimas 24 horas.
export default function AdmissionNotificationCenter({
  open,
  canReceiveAdmissions,
  canReceiveTriage,
  notifications,
  triageNotifications,
  onAdmit,
  onTriage,
  onTriageFolderViewed,
  onClose,
}: AdmissionNotificationCenterProps) {
  const themeVars = useThemeVars()
  const [active, setActive] = useState<FolderKey>("urgent")
  const [now, setNow] = useState(() => Date.now())

  const folders = useMemo<Folder[]>(() => {
    const result: Folder[] = []

    if (canReceiveAdmissions) {
      const pending = notifications.filter(isPending)
      const renderAdmissions = (items: AdmissionNotification[]) => (now: number) =>
        items.map((n) => (
          <AdmissionNotificationCard key={n.id} notification={n} onAdmit={onAdmit} now={now} />
        ))
      const urgent = pending.filter((n) => n.isUrgent)
      const nonUrgent = pending.filter((n) => !n.isUrgent)
      const resolved = notifications.filter((n) => !isPending(n))

      result.push(
        {
          key: "urgent",
          label: "Urgentes",
          hint: "Prioridad I a III",
          icon: <AlertOutlined />,
          tone: "danger",
          count: urgent.length,
          actionable: true,
          render: renderAdmissions(urgent),
          empty: "No hay urgencias pendientes de admisión.",
        },
        {
          key: "pending",
          label: "Pendientes",
          hint: "Prioridad IV y V",
          icon: <FolderOpenOutlined />,
          tone: "warning",
          count: nonUrgent.length,
          actionable: true,
          render: renderAdmissions(nonUrgent),
          empty: "No hay pacientes en espera de admisión.",
        },
        {
          key: "resolved",
          label: "Atendidas",
          hint: "Últimas 24 horas",
          icon: <CheckCircleOutlined />,
          tone: "success",
          count: resolved.length,
          actionable: false,
          render: renderAdmissions(resolved),
          empty: "Aún no se ha admisionado ningún paciente notificado.",
        },
      )
    }

    if (canReceiveTriage) {
      const renderTriage = (items: TriageNotification[]) => (now: number) =>
        items.map((n) => (
          <TriageNotificationCard key={n.id} notification={n} onTriage={onTriage} now={now} />
        ))
      const waiting = triageNotifications.filter((n) => n.status === "PENDIENTE")
      const triaged = triageNotifications.filter((n) => n.status !== "PENDIENTE")

      result.push(
        {
          key: "triage",
          label: "Por triage",
          hint: "Pacientes nuevos",
          icon: <UserAddOutlined />,
          tone: "info",
          count: waiting.length,
          actionable: true,
          render: renderTriage(waiting),
          empty: "No hay pacientes nuevos esperando triage.",
        },
        {
          key: "triaged",
          label: "Triados",
          hint: "Últimas 24 horas",
          icon: <CheckCircleOutlined />,
          tone: "success",
          count: triaged.length,
          actionable: false,
          render: renderTriage(triaged),
          empty: "Aún no se ha hecho triage a ningún paciente notificado.",
        },
      )
    }

    return result
  }, [
    canReceiveAdmissions,
    canReceiveTriage,
    notifications,
    triageNotifications,
    onAdmit,
    onTriage,
  ])

  // Al abrir, la primera carpeta con pendientes.
  useEffect(() => {
    if (!open) return
    setNow(Date.now())
    const firstWithItems = folders.find((f) => f.actionable && f.count > 0)
    setActive(firstWithItems?.key ?? folders[0]?.key ?? "urgent")
    // Solo al abrir: después el usuario elige la carpeta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Mantiene al día el "hace X min" mientras está abierto.
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [open])

  const current = folders.find((f) => f.key === active) ?? folders[0]

  // Ver la carpeta de triage marca como vistos los pacientes nuevos.
  const viewingTriage = open && current?.key === "triage"
  useEffect(() => {
    if (viewingTriage) onTriageFolderViewed()
  }, [viewingTriage, onTriageFolderViewed])

  if (!current) return null

  const admissionPending = folders
    .filter((f) => f.key === "urgent" || f.key === "pending")
    .reduce((sum, f) => sum + f.count, 0)
  const triagePending = folders.find((f) => f.key === "triage")?.count ?? 0

  const summary = [
    canReceiveAdmissions &&
      (admissionPending === 0
        ? "Sin pacientes pendientes de admisión"
        : `${admissionPending} ${admissionPending === 1 ? "paciente pendiente" : "pacientes pendientes"} de admisión`),
    canReceiveTriage &&
      (triagePending === 0
        ? "Sin pacientes esperando triage"
        : `${triagePending} ${triagePending === 1 ? "paciente espera" : "pacientes esperan"} triage`),
  ]
    .filter(Boolean)
    .join(" · ")

  const items = current.render(now)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      centered
      footer={null}
      rootClassName="anc-root"
      styles={{ body: { padding: 0 } }}
      title={null}
    >
      <div className="anc-center" style={themeVars}>
        <header className="anc-center-header">
          <span className="anc-center-icon">
            <BellOutlined />
          </span>
          <div>
            <h3 className="anc-center-title">Centro de notificaciones</h3>
            <p className="anc-center-subtitle">{summary}</p>
          </div>
        </header>

        <div className="anc-folders" role="tablist">
          {folders.map((folder) => (
            <button
              key={folder.key}
              type="button"
              role="tab"
              aria-selected={folder.key === current.key}
              className={`anc-folder-tab tone-${folder.tone}${folder.key === current.key ? " is-active" : ""}`}
              onClick={() => setActive(folder.key)}
            >
              <span className="anc-folder-tab-icon">{folder.icon}</span>
              <span className="anc-folder-tab-text">
                <span className="anc-folder-tab-label">{folder.label}</span>
                <span className="anc-folder-tab-hint">{folder.hint}</span>
              </span>
              <span className="anc-folder-count">{folder.count}</span>
            </button>
          ))}
        </div>

        <div className={`anc-folder-panel tone-${current.tone}`} role="tabpanel">
          {items.length === 0 ? (
            <div className="anc-empty">
              <InboxOutlined />
              <span>{current.empty}</span>
            </div>
          ) : (
            <div className="anc-list">{items}</div>
          )}
        </div>
      </div>
    </Modal>
  )
}
