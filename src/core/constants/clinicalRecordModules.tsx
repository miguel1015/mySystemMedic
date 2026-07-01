"use client"

import {
  AuditOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FormOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  RadarChartOutlined,
  ScissorOutlined,
  SolutionOutlined,
  ToolOutlined,
} from "@ant-design/icons"
import type { ReactNode } from "react"

export type ClinicalRecordModuleType =
  | "initial-clinical-history"
  | "evolutions"
  | "surgical-description"
  | "discharge-note"
  | "nursing-notes"
  | "minor-procedures"
  | "medical-note"
  | "diagnostic-procedures"
  | "non-surgical-procedures"
  | "radiology-study"
  | "specialist-evolution"

export interface ClinicalRecordModule {
  key: ClinicalRecordModuleType
  label: string
  icon: ReactNode
  path: string
  color: string
}

export const CLINICAL_RECORD_MODULES: ClinicalRecordModule[] = [
  {
    key: "initial-clinical-history",
    label: "Historia clínica inicial",
    icon: <FileTextOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/initialClinicalHistory",
    color: "var(--theme-primary, #0F6F5C)",
  },
  {
    key: "evolutions",
    label: "Evoluciones",
    icon: <HistoryOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/evolutions",
    color: "#1677ff",
  },
  {
    key: "surgical-description",
    label: "Descripción quirúrgica",
    icon: <ScissorOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/surgicalDescription",
    color: "#531dab",
  },
  {
    key: "discharge-note",
    label: "Nota de egreso",
    icon: <LogoutOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/dischargeNote",
    color: "#d46b08",
  },
  {
    key: "nursing-notes",
    label: "Notas de enfermería",
    icon: <MedicineBoxOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/nursingNotes",
    color: "#389e0d",
  },
  {
    key: "minor-procedures",
    label: "Procedimientos menores",
    icon: <ToolOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/minorProcedures",
    color: "#08979c",
  },
  {
    key: "medical-note",
    label: "Nota médica",
    icon: <FormOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/medicalNote",
    color: "#c41d7f",
  },
  {
    key: "diagnostic-procedures",
    label: "Procedimientos diagnósticos",
    icon: <ExperimentOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/diagnosticProcedures",
    color: "#d4380d",
  },
  {
    key: "non-surgical-procedures",
    label: "Procedimientos no quirúrgicos",
    icon: <AuditOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/nonSurgicalProcedures",
    color: "#722ed1",
  },
  {
    key: "radiology-study",
    label: "Estudio radiólogo",
    icon: <RadarChartOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/radiologyStudy",
    color: "#fa8c16",
  },
  {
    key: "specialist-evolution",
    label: "Evolución de especialista",
    icon: <SolutionOutlined style={{ fontSize: 20 }} />,
    path: "/care/clinicalRecords/specialistEvolution",
    color: "#13c2c2",
  },
]

export const getClinicalRecordModule = (key: string) =>
  CLINICAL_RECORD_MODULES.find((module) => module.key === key)
