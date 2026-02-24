"use client"

import Modal from "@/components/modal"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import {
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  AlertOutlined,
  FormOutlined,
  InboxOutlined,
  RadarChartOutlined,
} from "@ant-design/icons"
import toast from "react-hot-toast"

interface ActionsModalProps {
  open: boolean;
  onClose: () => void;
  patient: ActiveAdmission | null;
}

const actions = [
  {
    key: "evolve",
    label: "Evolucionar Historia Clínica",
    icon: <FileTextOutlined style={{ fontSize: 28 }} />,
    path: "/care/careManagement",
    color: "#0F6F5C",
  },
  {
    key: "expense-urgency",
    label: "Hoja de Gastos Urgencia",
    icon: <AlertOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/urgency",
    color: "#d4380d",
  },
  {
    key: "expense-hospitalization",
    label: "Hoja de Gastos Hospitalización",
    icon: <InboxOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/hospitalization",
    color: "#1677ff",
  },
  {
    key: "expense-surgery",
    label: "Hoja de Gastos Cirugía",
    icon: <ScissorOutlined style={{ fontSize: 28 }} />,
    path: "/care/expenseSheet/surgery",
    color: "#531dab",
  },
  {
    key: "lab-sheet",
    label: "Hoja de Laboratorio",
    icon: <ExperimentOutlined style={{ fontSize: 28 }} />,
    path: "/care/labSheet",
    color: "#08979c",
  },
  {
    key: "medication",
    label: "Aplicación de Medicamentos",
    icon: <MedicineBoxOutlined style={{ fontSize: 28 }} />,
    path: "/care/medicationApplication",
    color: "#389e0d",
  },
  {
    key: "xray",
    label: "Rayos X",
    icon: <RadarChartOutlined style={{ fontSize: 28 }} />,
    path: "/care/xray",
    color: "#d46b08",
  },
  {
    key: "medication-pos",
    label: "Medicamentos POS",
    icon: <FormOutlined style={{ fontSize: 28 }} />,
    path: "/care/medicationPos",
    color: "#c41d7f",
  },
]

const ActionsModal = ({ open, onClose, patient }: ActionsModalProps) => {
  const handleAction = () => {
    toast("Vista solo visual", { icon: "ℹ️" })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Acciones del Paciente" size="lg">
      {patient && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              backgroundColor: "#f0f7f4",
              borderLeft: "4px solid #0F6F5C",
              padding: "12px 16px",
              borderRadius: "0 8px 8px 0",
            }}
          >
            <span style={{ fontWeight: 600, color: "#0F6F5C" }}>Paciente: </span>
            <span style={{ fontWeight: 500 }}>{patient.patientFullName}</span>
            <span style={{ color: "#666", marginLeft: 12 }}>
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
            onClick={() => handleAction()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "24px 16px",
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              backgroundColor: "#fafffe",
              cursor: "pointer",
              transition: "all 0.25s ease",
              minHeight: 140,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = action.color + "12"
              e.currentTarget.style.borderColor = action.color
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}25`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fafffe"
              e.currentTarget.style.borderColor = "#e8e8e8"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: action.color + "15",
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
                color: "#333",
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
