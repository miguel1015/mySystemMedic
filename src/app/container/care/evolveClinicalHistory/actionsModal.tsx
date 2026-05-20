"use client"

import Modal from "@/components/modal"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import {
  AlertOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FormOutlined,
  InboxOutlined,
  MedicineBoxOutlined,
  RadarChartOutlined,
  ScissorOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"

interface ActionsModalProps {
  open: boolean;
  onClose: () => void;
  patient: ActiveAdmission | null;
}

const actions = [
  {
    key: "evolve",
    label: "Evolucionar Historia Clinica",
    icon: <FileTextOutlined style={{ fontSize: 28 }} />,
    path: "/care/careManagement",
    color: "var(--theme-primary, #0F6F5C)",
    hoverBackground: "rgba(var(--theme-primary-rgb, 15,111,92), 0.12)",
    iconBackground: "rgba(var(--theme-primary-rgb, 15,111,92), 0.15)",
    shadowColor: "rgba(var(--theme-primary-rgb, 15,111,92), 0.25)",
  },
  {
    key: "expense-urgency",
    label: "Hoja de Gastos de Urgencias",
    icon: <AlertOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/urgency",
    color: "#d4380d",
    hoverBackground: "#d4380d12",
    iconBackground: "#d4380d15",
    shadowColor: "#d4380d25",
  },
  {
    key: "expense-hospitalization",
    label: "Hoja de Gastos Hospitalizacion",
    icon: <InboxOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/hospitalization",
    color: "#1677ff",
    hoverBackground: "#1677ff12",
    iconBackground: "#1677ff15",
    shadowColor: "#1677ff25",
  },
  {
    key: "expense-surgery",
    label: "Hoja Gastos de Cirugia",
    icon: <ScissorOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/surgery",
    color: "#531dab",
    hoverBackground: "#531dab12",
    iconBackground: "#531dab15",
    shadowColor: "#531dab25",
  },
  {
    key: "lab-sheet",
    label: "Laboratorios",
    icon: <ExperimentOutlined style={{ fontSize: 28 }} />,
    path: "/care/labSheet",
    color: "#08979c",
    hoverBackground: "#08979c12",
    iconBackground: "#08979c15",
    shadowColor: "#08979c25",
  },
  {
    key: "medication",
    label: "Aplicacion de Medicamentos",
    icon: <MedicineBoxOutlined style={{ fontSize: 28 }} />,
    path: "/care/medicationApplication",
    color: "#389e0d",
    hoverBackground: "#389e0d12",
    iconBackground: "#389e0d15",
    shadowColor: "#389e0d25",
  },
  {
    key: "xray",
    label: "Rayos X",
    icon: <RadarChartOutlined style={{ fontSize: 28 }} />,
    path: "/care/xray",
    color: "#d46b08",
    hoverBackground: "#d46b0812",
    iconBackground: "#d46b0815",
    shadowColor: "#d46b0825",
  },
  {
    key: "medication-pos",
    label: "Medicamentos POS",
    icon: <FormOutlined style={{ fontSize: 28 }} />,
    path: "/care/medicationPos",
    color: "#c41d7f",
    hoverBackground: "#c41d7f12",
    iconBackground: "#c41d7f15",
    shadowColor: "#c41d7f25",
  },
]

const ActionsModal = ({ open, onClose, patient }: ActionsModalProps) => {
  const router = useRouter()

  const handleAction = (path: string) => {
    if (!patient) return

    const params = new URLSearchParams({
      admissionId: String(patient.id),
      patientId: String(patient.patientId),
      patientName: patient.patientFullName,
      documentNumber: patient.documentNumber,
      careScope: patient.careScope,
      admissionDate: patient.admissionDate,
    })

    router.push(`${path}?${params.toString()}`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Acciones del Paciente" size="lg">
      {patient && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              backgroundColor: "rgba(var(--theme-primary-rgb, 15,111,92), 0.08)",
              borderLeft: "4px solid var(--theme-primary, #0F6F5C)",
              padding: "12px 16px",
              borderRadius: "0 8px 8px 0",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--theme-primary, #0F6F5C)" }}>Paciente: </span>
            <span style={{ fontWeight: 500 }}>{patient.patientFullName}</span>
            <span style={{ color: "var(--dash-text-secondary, #6b7280)", marginLeft: 12 }}>
              Doc: {patient.documentNumber}
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => handleAction(action.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "24px 16px",
              border: "1px solid var(--dash-border, #e5e7eb)",
              borderRadius: 12,
              backgroundColor: "var(--dash-surface, #ffffff)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              minHeight: 140,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = action.hoverBackground
              e.currentTarget.style.borderColor = action.color
              e.currentTarget.style.transform = "translateY(1px)"
              e.currentTarget.style.boxShadow = `inset 0 2px 5px ${action.shadowColor}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--dash-surface, #ffffff)"
              e.currentTarget.style.borderColor = "var(--dash-border, #e5e7eb)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: action.iconBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: action.color,
              }}
            >
              {action.icon}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                color: "var(--dash-text-primary, #111827)",
                lineHeight: 1.3,
              }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

export default ActionsModal
