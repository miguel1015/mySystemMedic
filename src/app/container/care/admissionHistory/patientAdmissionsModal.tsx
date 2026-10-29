"use client"

import Modal from "@/components/modal"
import { Button, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { FileSearchOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import {
  AdmissionHistoryItem,
  AdmissionHistoryPatient,
} from "@/core/interfaces/care/types"
import { useGetAdmissionHistoryByPatient } from "@/core/hooks/care/admissions/useAdmissionHistory"
import { formatDateTime } from "@/core/utils/date"
import { ADMISSION_STATUS_COLOR } from "./admissionHistory.utils"

interface PatientAdmissionsModalProps {
  patient: AdmissionHistoryPatient | null
  onClose: () => void
}

export default function PatientAdmissionsModal({
  patient,
  onClose,
}: PatientAdmissionsModalProps) {
  const router = useRouter()
  const { data: admissions = [], isLoading } = useGetAdmissionHistoryByPatient(
    patient?.patientId,
  )

  const columns: ColumnsType<AdmissionHistoryItem> = [
    { title: "N° admisión", dataIndex: "id", key: "id" },
    {
      title: "Fecha de admisión",
      dataIndex: "admissionDate",
      key: "admissionDate",
      render: (value: string) => formatDateTime(value),
    },
    { title: "Ámbito", dataIndex: "careScopeName", key: "careScopeName" },
    { title: "Tipo", dataIndex: "admissionTypeName", key: "admissionTypeName" },
    { title: "Triage", dataIndex: "triagePrioridad", key: "triagePrioridad", align: "center" },
    { title: "EPS", dataIndex: "epsNombre", key: "epsNombre" },
    { title: "Convenio", dataIndex: "convenioNombre", key: "convenioNombre" },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (_, r) => (
        <Tag color={ADMISSION_STATUS_COLOR[r.estado]}>
          {r.estado}
          {r.numeroFactura ? ` · ${r.numeroFactura}` : ""}
        </Tag>
      ),
    },
    {
      title: "Detalle",
      key: "detalle",
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Button
          type="link"
          icon={<FileSearchOutlined />}
          onClick={() => router.push(`/care/admissionHistory/${r.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ]

  return (
    <Modal
      open={!!patient}
      onClose={onClose}
      title={
        patient
          ? `Historial de admisiones · ${patient.nombrePaciente} (${patient.documentTypeCode} ${patient.documentoPatiente})`
          : "Historial de admisiones"
      }
      size="xl"
    >
      <Table<AdmissionHistoryItem>
        size="middle"
        columns={columns}
        dataSource={admissions}
        loading={isLoading}
        rowKey="id"
        pagination={admissions.length > 10 ? { pageSize: 10 } : false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "El paciente no tiene admisiones cerradas" }}
      />
    </Modal>
  )
}
