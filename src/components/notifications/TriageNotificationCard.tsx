"use client"

import { CSSProperties } from "react"
import { Button } from "antd"
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { TriageNotification } from "@/core/interfaces/care/triageNotifications"
import { formatTime, timeAgo } from "./admissionNotificationUtils"

interface TriageNotificationCardProps {
  notification: TriageNotification
  onTriage: (notification: TriageNotification) => void
  now?: number
}

// Edad en años cumplidos a partir de la fecha de nacimiento (sin zona horaria).
function ageInYears(birthDate: string, now: number) {
  const [y, m, d] = birthDate.slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return null
  const today = new Date(now)
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age >= 0 ? age : null
}

export default function TriageNotificationCard({
  notification: n,
  onTriage,
  now = Date.now(),
}: TriageNotificationCardProps) {
  const pending = n.status === "PENDIENTE"
  const isNew = pending && !n.seen
  const document = [n.documentTypeCode, n.documentNumber].filter(Boolean).join(" ")
  const age = ageInYears(n.birthDate, now)

  return (
    <article
      className={`anc-card${pending ? "" : " is-resolved"}`}
      style={{ "--anc-priority": "var(--anc-primary)" } as CSSProperties}
    >
      <div className="anc-card-priority" aria-hidden>
        <UserAddOutlined />
      </div>

      <div className="anc-card-body">
        <div className="anc-card-top">
          <strong className="anc-card-name">{n.patientName || "Paciente sin nombre"}</strong>
          {pending && <span className="anc-card-tag">{isNew ? "Nuevo" : "Espera triage"}</span>}
        </div>

        <div className="anc-card-doc">
          <IdcardOutlined /> {document}
          {age !== null && ` · ${age} ${age === 1 ? "año" : "años"}`}
        </div>

        {n.insurerName && (
          <div className="anc-card-doc">
            <SafetyCertificateOutlined /> {n.insurerName}
          </div>
        )}

        <div className="anc-card-meta">
          {pending ? (
            <>
              <span title={formatTime(n.createdAt)}>
                <ClockCircleOutlined /> {timeAgo(n.createdAt, now)}
              </span>
              {n.createdByName && (
                <span>
                  <UserOutlined /> Registrado por {n.createdByName}
                </span>
              )}
            </>
          ) : (
            <span className="anc-card-resolved">
              <CheckCircleFilled /> Triage realizado
              {n.resolvedByName ? ` por ${n.resolvedByName}` : ""}
              {n.resolvedAt ? ` · ${formatTime(n.resolvedAt)}` : ""}
            </span>
          )}
        </div>
      </div>

      {pending && (
        <div className="anc-card-action">
          <Button type="primary" icon={<MedicineBoxOutlined />} onClick={() => onTriage(n)}>
            Hacer triage
          </Button>
        </div>
      )}
    </article>
  )
}
