"use client"

import { CSSProperties } from "react"
import { Button, Tooltip } from "antd"
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  IdcardOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import { TRIAGE_PRIORITY_META, formatTime, isPending, timeAgo } from "./admissionNotificationUtils"

interface AdmissionNotificationCardProps {
  notification: AdmissionNotification
  onAdmit: (notification: AdmissionNotification) => void
  now?: number
}

export default function AdmissionNotificationCard({
  notification: n,
  onAdmit,
  now,
}: AdmissionNotificationCardProps) {
  const meta = TRIAGE_PRIORITY_META[n.priority]
  const pending = isPending(n)
  const document = [n.documentTypeCode, n.documentNumber].filter(Boolean).join(" ")

  return (
    <article
      className={`anc-card${pending ? "" : " is-resolved"}${pending && n.isUrgent ? " is-urgent" : ""}`}
      style={{ "--anc-priority": meta.color } as CSSProperties}
    >
      <Tooltip title={`Prioridad ${n.priority} · ${meta.name}`}>
        <div className="anc-card-priority">
          <span>{n.priority}</span>
        </div>
      </Tooltip>

      <div className="anc-card-body">
        <div className="anc-card-top">
          <strong className="anc-card-name">{n.patientName || "Paciente sin nombre"}</strong>
          <span className="anc-card-tag">{meta.name}</span>
        </div>

        <div className="anc-card-doc">
          <IdcardOutlined /> {document}
        </div>

        {n.consultationReason && (
          <p className="anc-card-reason" title={n.consultationReason}>
            {n.consultationReason}
          </p>
        )}

        <div className="anc-card-meta">
          {pending ? (
            <>
              <span title={formatTime(n.createdAt)}>
                <ClockCircleOutlined /> {timeAgo(n.createdAt, now)}
              </span>
              {n.createdByName && (
                <span>
                  <UserOutlined /> Triage por {n.createdByName}
                </span>
              )}
            </>
          ) : (
            <span className="anc-card-resolved">
              <CheckCircleFilled /> Admisionado
              {n.resolvedByName ? ` por ${n.resolvedByName}` : ""}
              {n.resolvedAt ? ` · ${formatTime(n.resolvedAt)}` : ""}
            </span>
          )}
        </div>
      </div>

      {pending && (
        <div className="anc-card-action">
          <Button
            type="primary"
            danger={n.isUrgent}
            icon={<SolutionOutlined />}
            onClick={() => onAdmit(n)}
          >
            Admisionar
          </Button>
        </div>
      )}
    </article>
  )
}
