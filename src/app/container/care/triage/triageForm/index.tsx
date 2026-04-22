"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Input as AntdInput,
  Radio,
  Spin,
  Tag,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ClearOutlined,
  SaveOutlined,
  FileSearchOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useController, Control } from "react-hook-form";
import {
  useTriageForm,
  type TriageFormMode,
  type TriageFormValues,
} from "./useTriageForm";
import {
  PatientMiniResponse,
  TriageResponse,
} from "@/core/interfaces/care/types";

const { TextArea } = AntdInput;

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border-subtle, #f0f0f3)",
  borderRadius: 10,
  padding: "20px 24px",
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--theme-primary, #0F6F5C)",
  marginBottom: 4,
  marginTop: 0,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "48px 24px",
  color: "var(--dash-text-tertiary, #9ca3af)",
  borderRadius: 10,
  border: "2px dashed var(--dash-border, #e5e7eb)",
  marginTop: 16,
};

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: "I - Resucitación", color: "#ff4d4f" },
  2: { label: "II - Emergencia", color: "#fa8c16" },
  3: { label: "III - Urgencia", color: "#fadb14" },
  4: { label: "IV - Menos urgente", color: "#52c41a" },
  5: { label: "V - No urgente", color: "#1890ff" },
};

interface TriageFormProps {
  mode?: TriageFormMode;
  initialTriage?: TriageResponse | null;
}

export default function TriageForm({
  mode = "create",
  initialTriage = null,
}: TriageFormProps) {
  const {
    control,
    handleSubmit,
    onSubmit,
    onInvalid,
    handleReset,
    patient,
    searchDoc,
    setSearchDoc,
    searchError,
    searching,
    handleSearchPatient,
    consultationReasonLength,
    isSubmitting,
    editingTriage,
  } = useTriageForm({ mode, initialTriage });

  const isEdit = mode === "edit";
  const showFormBody = isEdit ? !!editingTriage : !!patient;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          {isEdit ? <UserOutlined /> : <FileSearchOutlined />}
          {isEdit ? "Paciente" : "Búsqueda de Paciente"}
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />

        {isEdit ? (
          editingTriage && (
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dash-text-tertiary, #9ca3af)",
                  }}
                >
                  Documento
                </div>
                <div style={{ fontWeight: 600, fontFamily: "monospace" }}>
                  {editingTriage.numeroDocumento}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dash-text-tertiary, #9ca3af)",
                  }}
                >
                  Paciente
                </div>
                <div style={{ fontWeight: 600 }}>
                  {editingTriage.nombrePaciente}
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, maxWidth: 480 }}>
              <AntdInput
                placeholder="Número de documento"
                prefix={
                  <SearchOutlined
                    style={{ color: "var(--theme-primary, #0F6F5C)" }}
                  />
                }
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleSearchPatient();
                }}
                size="large"
                style={{ borderRadius: 8 }}
              />
              <Button
                type="primary"
                size="large"
                onClick={handleSearchPatient}
                loading={searching}
                icon={<SearchOutlined />}
              >
                Buscar
              </Button>
            </div>

            {searchError && (
              <Alert
                style={{ marginTop: 12 }}
                type={searchError.type === "not-found" ? "warning" : "error"}
                showIcon
                title={
                  searchError.type === "not-found"
                    ? "Paciente no encontrado"
                    : "No se pudo realizar la búsqueda"
                }
                description={
                  searchError.type === "not-found" ? (
                    <>
                      {searchError.message} Verifica el número o{" "}
                      <strong>regístralo desde el módulo de Pacientes</strong>{" "}
                      antes de continuar con el triaje.
                    </>
                  ) : (
                    searchError.message
                  )
                }
              />
            )}

            {patient && <PatientCard patient={patient} />}
          </>
        )}
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      )}

      {!showFormBody && !searching && !isEdit && (
        <div style={emptyStateStyle}>
          <UserOutlined
            style={{
              fontSize: 40,
              color: "var(--dash-text-tertiary, #9ca3af)",
              marginBottom: 12,
            }}
          />
          <p
            style={{
              fontSize: 15,
              margin: 0,
              color: "var(--dash-text-tertiary, #9ca3af)",
            }}
          >
            Ingrese un número de documento y presione <strong>Buscar</strong>{" "}
            para comenzar el registro de triage.
          </p>
        </div>
      )}

      {showFormBody && (
        <>
          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <MedicineBoxOutlined />
              Triage
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer gap="g-3">
              <Input
                type="datetime-local"
                name="dateTime"
                label="Fecha y Hora"
                control={control}
              />
            </GridContainer>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                Prioridad
              </label>
              <PrioritySelector control={control} />
            </div>

            <ConsultationReasonField
              control={control}
              length={consultationReasonLength}
            />
          </div>

          <div style={sectionCardStyle}>
            <p style={sectionTitleStyle}>
              <HeartOutlined />
              Signos Vitales
            </p>
            <Divider style={{ margin: "8px 0 16px" }} />

            <GridContainer columns="col-4" gap="g-3">
              <Input
                name="bloodPressure"
                label="Tensión Arterial"
                placeholder="Ej: 120/80"
                maxLength={30}
                control={control}
              />
              <Input
                type="number"
                name="heartRate"
                label="Frecuencia Cardiaca (lpm)"
                placeholder="Ej: 72"
                control={control}
              />
              <Input
                type="number"
                name="respiratoryRate"
                label="Frecuencia Respiratoria (rpm)"
                placeholder="Ej: 18"
                control={control}
              />
              <Input
                type="number"
                name="weight"
                label="Peso (kg)"
                placeholder="Ej: 70.5"
                step="0.1"
                control={control}
              />
              <Input
                type="number"
                name="height"
                label="Talla (cm)"
                placeholder="Ej: 170.5"
                step="0.1"
                control={control}
              />
              <Input
                type="number"
                name="temperature"
                label="Temperatura (°C)"
                placeholder="Ej: 36.5"
                step="0.1"
                control={control}
              />
              <Input
                type="number"
                name="glasgow"
                label="Glasgow (3-15)"
                placeholder="Ej: 15"
                control={control}
              />
            </GridContainer>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<ClearOutlined />} onClick={handleReset}>
              {isEdit ? "Cancelar" : "Limpiar"}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEdit ? "Actualizar Triage" : "Guardar Triage"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

function PrioritySelector({ control }: { control: Control<TriageFormValues> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "priority", control });

  return (
    <div>
      <Radio.Group
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = field.value === level;
          return (
            <Radio.Button
              key={level}
              value={level}
              style={{
                borderColor: isSelected
                  ? priorityLabels[level].color
                  : undefined,
                color: isSelected ? "#fff" : priorityLabels[level].color,
                background: isSelected
                  ? priorityLabels[level].color
                  : undefined,
                fontWeight: 600,
                minWidth: 160,
                textAlign: "center",
                height: 36,
                lineHeight: "34px",
              }}
            >
              {priorityLabels[level].label}
            </Radio.Button>
          );
        })}
      </Radio.Group>
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );
}

function calculateAge(birthDate: string): number | null {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function getSexIcon(sexo?: string | null) {
  if (!sexo) return <UserOutlined />;
  const normalized = sexo.toLowerCase();
  if (normalized.startsWith("f") || normalized.includes("mujer")) {
    return <WomanOutlined />;
  }
  if (normalized.startsWith("m") || normalized.includes("hombre")) {
    return <ManOutlined />;
  }
  return <UserOutlined />;
}

function PatientChip({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: "var(--dash-surface, #ffffff)",
        border: "1px solid var(--dash-border-subtle, #e5e7eb)",
        borderRadius: 8,
        minWidth: 150,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: 6,
          background: "rgba(15, 111, 92, 0.1)",
          color: "var(--theme-primary, #0F6F5C)",
          fontSize: 14,
        }}
      >
        {icon}
      </span>
      <div
        style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--dash-text-tertiary, #9ca3af)",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            fontFamily: mono ? "monospace" : undefined,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function PatientCard({ patient }: { patient: PatientMiniResponse }) {
  const fullName = [
    patient.primerNombre,
    patient.segundoNombre,
    patient.primerApellido,
    patient.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = [patient.primerNombre, patient.primerApellido]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join("");

  const age = patient.fechaNacimiento
    ? calculateAge(patient.fechaNacimiento)
    : null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(82, 196, 26, 0.35)",
        background:
          "linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(15, 111, 92, 0.04) 100%)",
        borderLeft: "4px solid #52c41a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
          color: "#389e0d",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        <CheckCircleFilled />
        Paciente encontrado
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          size={64}
          style={{
            background: "var(--theme-primary, #0F6F5C)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials || <UserOutlined />}
        </Avatar>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--dash-text-primary, #111827)",
              marginBottom: 4,
            }}
          >
            {fullName}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag color="success" style={{ margin: 0 }}>
              Activo
            </Tag>
            {age !== null && (
              <Tag color="blue" style={{ margin: 0 }}>
                {age} {age === 1 ? "año" : "años"}
              </Tag>
            )}
            {patient.sexo && (
              <Tag
                color="geekblue"
                icon={getSexIcon(patient.sexo)}
                style={{ margin: 0 }}
              >
                {patient.sexo}
              </Tag>
            )}
            {patient.fechaNacimiento && (
              <Tag icon={<CalendarOutlined />} style={{ margin: 0 }}>
                {new Date(patient.fechaNacimiento).toLocaleDateString()}
              </Tag>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsultationReasonField({
  control,
  length,
}: {
  control: Control<TriageFormValues>;
  length: number;
}) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "consultationReason", control });

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <label style={{ fontWeight: 500 }}>Motivo de Consulta</label>
        <span
          style={{
            fontSize: 12,
            color:
              length > 500 ? "#ff4d4f" : "var(--dash-text-tertiary, #9ca3af)",
          }}
        >
          {length}/500
        </span>
      </div>
      <TextArea
        {...field}
        rows={3}
        maxLength={500}
        placeholder="Describa el motivo de consulta del paciente..."
        status={error ? "error" : undefined}
        value={field.value ?? ""}
        style={{ borderRadius: 6 }}
      />
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );
}
