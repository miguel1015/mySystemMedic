import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { Tag } from "antd"

// Estado del RIPS frente al MUV. Mientras no exista la integración en el backend,
// todas las facturas quedan en "pending".
export type RipsStatus = "pending" | "validated" | "rejected"

const STATUS_CONFIG: Record<RipsStatus, { color: string; label: string; icon: React.ReactNode }> = {
  pending: { color: "default", label: "Pendiente", icon: <ClockCircleOutlined /> },
  validated: { color: "success", label: "Validado (CUV)", icon: <CheckCircleOutlined /> },
  rejected: { color: "error", label: "Rechazado", icon: <CloseCircleOutlined /> },
}

export function RipsStatusTag({ status }: { status: RipsStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Tag color={config.color} icon={config.icon} style={{ marginInlineEnd: 0 }}>
      {config.label}
    </Tag>
  )
}
