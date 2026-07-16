"use client";

import { Container } from "@/components/container";
import { useMe } from "@/core/hooks/users/useMeUser";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById";
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient";
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission";
import { useGetNotasMedicasByAdmission } from "@/core/hooks/care/notasMedicas/useGetNotasMedicasByAdmission";
import { useGetEvolucionesByAdmission } from "@/core/hooks/care/evoluciones/useGetEvolucionesByAdmission";
import { useGetEvolucionEspecialistasByAdmission } from "@/core/hooks/care/evolucionEspecialista/useGetEvolucionEspecialistasByAdmission";
import { useGetProcedimientosMenoresByAdmission } from "@/core/hooks/care/procedimientosMenores/useGetProcedimientosMenoresByAdmission";
import { useGetProcedimientosDiagnosticosByAdmission } from "@/core/hooks/care/procedimientosDiagnosticos/useGetProcedimientosDiagnosticosByAdmission";
import { useGetProcedimientosNoQxByAdmission } from "@/core/hooks/care/procedimientosNoQx/useGetProcedimientosNoQxByAdmission";
import { useGetNotasEnfermeriaByAdmission } from "@/core/hooks/care/notasEnfermeria/useGetNotasEnfermeriaByAdmission";
import { GetUser } from "@/core/interfaces/user/users";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Tag, Typography, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DischargeNoteContent } from "../dischargeNote/DischargeNoteContent";
import { sidebarRecords } from "./constants";
import HciPrintPreviewModal from "./printPreview/HciPrintPreviewModal";
import { DiagnosticProceduresSection } from "./sections/DiagnosticProceduresSection";
import { EvolutionSection } from "./sections/EvolutionSection";
import { HciSection } from "./sections/HciSection";
import { MedicalNotesSection } from "./sections/MedicalNotesSection";
import { MinorProceduresSection } from "./sections/MinorProceduresSection";
import { NonSurgicalSection } from "./sections/NonSurgicalSection";
import { NursingNoteSection } from "./sections/NursingNoteSection";
import { SpecialistEvolutionSection } from "./sections/SpecialistEvolutionSection";
import { SurgicalDescriptionSection } from "./sections/SurgicalDescriptionSection";
import type { DiagnosisRow } from "./types";
import "./initialClinicalHistory.css";

const buildFullName = (user?: GetUser) => {
  if (!user) return "";
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    user.email
  );
};

const formatAdmissionDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAdmissionTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "21 años";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
    age -= 1;
  return `${age} años`;
};

const clickableSidebarKeys = new Set([
  "hci",
  "quirurgica",
  "evoluciones",
  "egreso",
  "enfermeria",
  "menores",
  "medicas",
  "diagnosticos",
  "noquirurgicos",
  "especialista",
]);

const InitialClinicalHistoryContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: me } = useMe();
  const { data: users = [] } = useGetUsers();

  const admissionId = searchParams.get("admissionId") || undefined;
  const editHci = searchParams.get("editHci") === "1";

  const { data: admission } = useGetAdmissionById(admissionId);
  const patientId =
    searchParams.get("patientId") ||
    (admission ? String(admission.patientId) : undefined);

  const { data: patientRecord } = useGetPatientById(patientId ?? null);
  const { data: existingHCInicial } = useGetHCInicialByAdmission(admissionId);
  const isHciClosed = existingHCInicial?.isClosed === true;
  const isHciLocked = isHciClosed && !editHci;

  const { data: notasMedicas } = useGetNotasMedicasByAdmission(admissionId);
  const { data: evoluciones } = useGetEvolucionesByAdmission(admissionId);
  const { data: evolucionEspecialistas } =
    useGetEvolucionEspecialistasByAdmission(admissionId);
  const { data: procedimientosMenores } =
    useGetProcedimientosMenoresByAdmission(admissionId);
  const { data: procedimientosDiagnosticos } =
    useGetProcedimientosDiagnosticosByAdmission(admissionId);
  const { data: procedimientosNoQx } =
    useGetProcedimientosNoQxByAdmission(admissionId);
  const { data: notasEnfermeria } =
    useGetNotasEnfermeriaByAdmission(admissionId);

  const sidebarCounts: Record<string, number> = {
    hci: existingHCInicial ? 1 : 0,
    medicas: notasMedicas?.length ?? 0,
    evoluciones: evoluciones?.length ?? 0,
    especialista: evolucionEspecialistas?.length ?? 0,
    menores: procedimientosMenores?.length ?? 0,
    diagnosticos: procedimientosDiagnosticos?.length ?? 0,
    noquirurgicos: procedimientosNoQx?.length ?? 0,
    enfermeria: notasEnfermeria?.length ?? 0,
  };

  const [admissionDate, setAdmissionDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [admissionDateHydrated, setAdmissionDateHydrated] = useState(false);
  const [admissionTime, setAdmissionTime] = useState(() =>
    new Date().toTimeString().slice(0, 8),
  );
  const [admissionTimeHydrated, setAdmissionTimeHydrated] = useState(false);

  useEffect(() => {
    if (!existingHCInicial) return;
    if (isHciLocked) {
      setAdmissionDate("");
      return;
    }
    if (!admissionDateHydrated) {
      setAdmissionDate(existingHCInicial.admissionDate?.slice(0, 10) || "");
      setAdmissionDateHydrated(true);
    }
  }, [existingHCInicial, admissionDateHydrated, isHciLocked]);

  useEffect(() => {
    if (!existingHCInicial) return;
    if (isHciLocked) {
      setAdmissionTime("");
      return;
    }
    if (!admissionTimeHydrated) {
      setAdmissionTime(existingHCInicial.admissionTime || "");
      setAdmissionTimeHydrated(true);
    }
  }, [existingHCInicial, admissionTimeHydrated, isHciLocked]);

  const patientFullName = [
    patientRecord?.firstName,
    patientRecord?.middleName,
    patientRecord?.lastName,
    patientRecord?.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const patient = {
    name:
      patientFullName ||
      admission?.nombrePaciente ||
      searchParams.get("patientName") ||
      "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber:
      admission?.documentoPatiente ||
      searchParams.get("documentNumber") ||
      "1102796382",
    careScope:
      admission?.careScopeName || searchParams.get("careScope") || "Urgencias",
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
    clinicalRecord:
      searchParams.get("clinicalRecord") || `HC-${patientId || "1024"}`,
    room: searchParams.get("room") || "Observacion 4",
    insurer: searchParams.get("insurer") || "EPS Sanitas",
    city: patientRecord?.cityName || searchParams.get("city") || "",
    phone: patientRecord?.phone || searchParams.get("phone") || "",
  };

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez";

  const canAssignDoctor = useMemo(() => {
    const role = (me?.role || "").toLowerCase();
    return ["admin", "administrador", "coordinador", "jefe"].some((word) =>
      role.includes(word),
    );
  }, [me?.role]);

  const doctorOptions = useMemo(() => {
    const mapped = users.map((user) => ({
      value: user.id,
      label: buildFullName(user),
      role: user.userRoleName,
    }));
    if (mapped.length) return mapped;
    return [
      { value: me?.id || 0, label: currentDoctor, role: me?.role || "Medico" },
    ];
  }, [currentDoctor, me?.id, me?.role, users]);

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(
    doctorOptions[0]?.value,
  );
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([]);
  const [activeSidebarKey, setActiveSidebarKey] = useState("hci");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!doctorOptions.length) return;
    if (
      selectedDoctorId === undefined ||
      !doctorOptions.some((d) => d.value === selectedDoctorId)
    ) {
      setSelectedDoctorId(doctorOptions[0].value);
    }
  }, [doctorOptions, selectedDoctorId]);

  const selectedDoctor =
    doctorOptions.find((d) => d.value === selectedDoctorId)?.label ||
    currentDoctor;
  const selectedDoctorUser = users.find((u) => u.id === selectedDoctorId);
  const currentDoctorUser = users.find((u) => u.id === me?.id);
  const mainDiagnosis = useMemo(
    () => diagnoses.find((d) => d.main && d.code),
    [diagnoses],
  );

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        {/* ════ HEADER ════ */}
        <div
          className="clinical-history-header"
          style={{
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            background: "var(--dash-surface, #fff)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div className="patient-avatar">
                {patient.name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title
                  level={4}
                  style={{ margin: 0 }}
                  className="clinical-history-patient-title"
                >
                  {patient.name}
                </Typography.Title>
                <div className="patient-meta">
                  <span className="patient-meta-chip">
                    {patient.documentType} {patient.documentNumber}
                  </span>
                  <span className="patient-meta-chip">
                    <CalendarOutlined /> {calculateAge(patient.birthDate)}
                  </span>
                  <span className="patient-meta-chip">
                    <UserOutlined /> {patient.sex}
                  </span>
                  <span className="patient-meta-chip">{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="clinical-history-actions">
              <Button
                icon={<FileDoneOutlined />}
                onClick={() => setPreviewOpen(true)}
              >
                Epicrisis
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Volver
              </Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de admisión</div>
              <div className="summary-cell-value">
                {formatAdmissionDate(admission?.admissionDate) || "—"}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Hora de admisión</div>
              <div className="summary-cell-value">
                {formatAdmissionTime(admission?.admissionDate) || "—"}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Servicio</div>
              <div className="summary-cell-value">{patient.careScope}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Médico tratante</div>
              <div className="summary-cell-value">
                {canAssignDoctor ? (
                  <Select
                    showSearch
                    value={selectedDoctorId}
                    options={doctorOptions}
                    onChange={setSelectedDoctorId}
                    style={{ width: "100%", marginTop: 2 }}
                    size="small"
                  />
                ) : (
                  selectedDoctor
                )}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Diagnóstico principal</div>
              <div className="summary-cell-value">
                {mainDiagnosis ? (
                  <Tag color="blue" style={{ whiteSpace: "normal", margin: 0 }}>
                    {mainDiagnosis.code} – {mainDiagnosis.diagnosis}
                  </Tag>
                ) : (
                  <span
                    style={{
                      color: "var(--dash-text-tertiary, #93a39d)",
                      fontSize: 12,
                    }}
                  >
                    Sin diagnóstico
                  </span>
                )}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>
                  Hospitalizado
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ WORKSPACE ════ */}
        <div className="evolution-workspace">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="clinical-sidebar">
            <div className="clinical-sidebar-header">
              <FileTextOutlined
                style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 14 }}
              />
              Historia clínica
            </div>

            <div className="clinical-sidebar-search">
              <Input
                prefix={
                  <SearchOutlined
                    style={{ color: "var(--dash-text-tertiary, #93a39d)" }}
                  />
                }
                placeholder="Buscar en la historia clínica..."
                allowClear
                size="small"
              />
            </div>

            <div className="sidebar-nav-list">
              {sidebarRecords.map((record) => {
                const count = sidebarCounts[record.key] ?? record.count;
                return (
                  <button
                    key={record.key}
                    type="button"
                    className={`sidebar-record-item${activeSidebarKey === record.key ? " active" : ""}${!clickableSidebarKeys.has(record.key) ? " sidebar-record-disabled" : ""}`}
                    onClick={() => {
                      if (clickableSidebarKeys.has(record.key))
                        setActiveSidebarKey(record.key);
                    }}
                  >
                    <div className="sidebar-record-icon">
                      <FileTextOutlined />
                    </div>
                    <div className="sidebar-record-content">
                      <div className="sidebar-record-title">{record.title}</div>
                      {record.date && (
                        <div className="sidebar-record-date">{record.date}</div>
                      )}
                    </div>
                    {count > 0 && (
                      <Tag
                        color="blue"
                        style={{ margin: 0, flexShrink: 0, fontSize: 10 }}
                      >
                        {count}
                      </Tag>
                    )}
                    <RightOutlined className="sidebar-record-chevron" />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── RIGHT AREA ── */}
          <div className="evolution-right">
            {activeSidebarKey === "hci" && (
              <HciSection
                admissionId={admissionId}
                patientId={patientId}
                diagnoses={diagnoses}
                onDiagnosesChange={setDiagnoses}
                patientName={patient.name}
                messageApi={messageApi}
                admissionDate={admissionDate}
                admissionTime={admissionTime}
                onAdmissionDateChange={setAdmissionDate}
                onAdmissionTimeChange={setAdmissionTime}
                editMode={editHci}
                onOpenPreview={() => setPreviewOpen(true)}
              />
            )}

            {activeSidebarKey === "quirurgica" && (
              <SurgicalDescriptionSection
                admissionId={admissionId}
                patientName={patient.name}
                messageApi={messageApi}
                historyClosed={isHciLocked}
              />
            )}

            {activeSidebarKey === "evoluciones" && (
              <EvolutionSection
                admissionId={admissionId}
                selectedDoctor={selectedDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={selectedDoctorUser}
              />
            )}

            {activeSidebarKey === "egreso" && (
              <DischargeNoteContent
                messageApi={messageApi}
                currentDoctor={currentDoctor}
              />
            )}

            {activeSidebarKey === "enfermeria" && (
              <NursingNoteSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}

            {activeSidebarKey === "diagnosticos" && (
              <DiagnosticProceduresSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}

            {activeSidebarKey === "menores" && (
              <MinorProceduresSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}

            {activeSidebarKey === "medicas" && (
              <MedicalNotesSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}

            {activeSidebarKey === "noquirurgicos" && (
              <NonSurgicalSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}

            {activeSidebarKey === "especialista" && (
              <SpecialistEvolutionSection
                admissionId={admissionId}
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
                patient={patient}
                admissionDate={admission?.admissionDate ?? ""}
                contractName={admission?.convenioNombre ?? ""}
                doctorUser={currentDoctorUser}
              />
            )}
          </div>
        </div>
      </div>

      <HciPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        admissionId={admissionId}
        patient={patient}
        admissionDate={admission?.admissionDate ?? ""}
        attentionDate={admissionDate}
        attentionTime={admissionTime}
        contractName={admission?.convenioNombre ?? ""}
        doctorName={selectedDoctor}
        doctorUser={selectedDoctorUser}
        diagnoses={diagnoses}
      />
    </Container>
  );
};

export default InitialClinicalHistoryContainer;
