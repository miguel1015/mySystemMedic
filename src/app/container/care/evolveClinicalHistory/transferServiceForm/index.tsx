"use client"

import SelectAutocomplete from "@/components/select"
import { Alert, Avatar, Button, Modal as AntdModal, Spin, Tag } from "antd"
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClearOutlined,
  IdcardOutlined,
  SaveOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { AnimatePresence, motion } from "framer-motion"
import { useWatch } from "react-hook-form"
import { useTransferServiceForm } from "./useTransferServiceForm"

const CARE_SCOPE_COLORS: Record<string, string> = {
  Triage: "gold",
  Urgencia: "red",
  Urgencias: "red",
  Hospitalización: "blue",
  "Consulta externa": "green",
  Cirugía: "purple",
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border-subtle, #f0f0f3)",
  borderRadius: 10,
  padding: "20px 24px",
  marginBottom: 20,
}

const patientCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 12,
  border: "1px solid rgba(15, 111, 92, 0.2)",
  background:
    "linear-gradient(135deg, rgba(15, 111, 92, 0.08) 0%, rgba(15, 111, 92, 0.02) 100%)",
  borderLeft: "4px solid var(--theme-primary, #0F6F5C)",
  marginBottom: 20,
}

const metaLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "var(--dash-text-tertiary, #9ca3af)",
  marginBottom: 2,
}

const metaValueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--dash-text-primary, #111827)",
}

const scopeCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
}

const previewCardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid rgba(82, 196, 26, 0.35)",
  background:
    "linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(15, 111, 92, 0.04) 100%)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 13,
}

const saveButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--theme-primary, #0F6F5C), #14b8a6)",
  border: "none",
  boxShadow: "0 4px 14px rgba(15, 111, 92, 0.35)",
  fontWeight: 600,
}

interface TransferServiceFormProps {
  admissionId: number | null
  onDone: () => void
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  return (first + last).toUpperCase()
}

export default function TransferServiceForm({
  admissionId,
  onDone,
}: TransferServiceFormProps) {
  const {
    control,
    handleSubmit,
    onSubmit,
    admission,
    isLoadingAdmission,
    isErrorAdmission,
    admissionError,
    refetchAdmission,
    isLoadingCatalogs,
    careScopeOptions,
    isSubmitting,
  } = useTransferServiceForm({ admissionId, onDone })

  const selectedScopeId = useWatch({ control, name: "careScopeId" })
  const selectedOption = careScopeOptions.find(
    (option) => Number(option.value) === Number(selectedScopeId),
  )
  const noScopesAvailable = !isLoadingCatalogs && careScopeOptions.length === 0

  if (isErrorAdmission) {
    return (
      <Alert
        type="error"
        showIcon
        message="No se pudo cargar la información de la admisión"
        description={
          admissionError instanceof Error
            ? admissionError.message
            : "Intenta nuevamente en unos segundos."
        }
        action={
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button size="small" onClick={() => refetchAdmission()}>
              Reintentar
            </Button>
            <Button size="small" onClick={onDone}>
              Cerrar
            </Button>
          </div>
        }
      />
    )
  }

  if (isLoadingAdmission || !admission) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    )
  }

  const confirmAndSubmit = handleSubmit((data) => {
    const targetOption = careScopeOptions.find(
      (option) => Number(option.value) === Number(data.careScopeId),
    )

    AntdModal.confirm({
      title: "Confirmar traslado de servicio",
      icon: <SwapOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>
            ¿Confirma trasladar a <strong>{admission.nombrePaciente}</strong>?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Tag color={CARE_SCOPE_COLORS[admission.careScopeName] ?? "default"}>
              {admission.careScopeName}
            </Tag>
            <ArrowRightOutlined style={{ color: "var(--dash-text-tertiary, #9ca3af)" }} />
            <Tag color="processing">{targetOption?.label}</Tag>
          </div>
        </div>
      ),
      okText: "Confirmar traslado",
      cancelText: "Cancelar",
      onOk: () => onSubmit(data),
    })
  })

  return (
    <motion.form
      onSubmit={confirmAndSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div style={patientCardStyle}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar
            size={56}
            style={{
              background: "var(--theme-primary, #0F6F5C)",
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(admission.nombrePaciente) || <UserOutlined />}
          </Avatar>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--dash-text-primary, #111827)",
                marginBottom: 6,
              }}
            >
              {admission.nombrePaciente}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={metaLabelStyle}>
                  <IdcardOutlined /> Documento
                </div>
                <div style={metaValueStyle}>{admission.documentoPatiente}</div>
              </div>
              <div>
                <div style={metaLabelStyle}>
                  <CalendarOutlined /> Fecha de admisión
                </div>
                <div style={metaValueStyle}>
                  {new Date(admission.admissionDate).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--theme-primary, #0F6F5C)",
            marginTop: 0,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <SwapOutlined />
          Traslado de servicio
        </p>

        {noScopesAvailable && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="No hay otros ámbitos de atención configurados para trasladar a este paciente."
          />
        )}

        <div style={scopeCardStyle}>
          <div>
            <div style={metaLabelStyle}>Ámbito actual</div>
            <Tag
              color={CARE_SCOPE_COLORS[admission.careScopeName] ?? "default"}
              style={{ fontSize: 13, padding: "4px 12px", borderRadius: 6 }}
            >
              {admission.careScopeName}
            </Tag>
          </div>

          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <ArrowRightOutlined
              style={{ fontSize: 18, color: "var(--theme-primary, #0F6F5C)" }}
            />
          </motion.div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <SelectAutocomplete
              name="careScopeId"
              label="Nuevo ámbito de atención"
              placeholder="Seleccione el servicio destino"
              control={control}
              options={careScopeOptions}
              loading={isLoadingCatalogs}
              disabled={noScopesAvailable}
            />
          </div>
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={previewCardStyle}
            >
              <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16 }} />
              <span>
                El paciente pasará de{" "}
                <strong>{admission.careScopeName}</strong> a{" "}
                <strong>{selectedOption.label}</strong>.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button icon={<ClearOutlined />} onClick={onDone}>
          Cancelar
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={isSubmitting}
          disabled={isSubmitting || !selectedOption}
          style={saveButtonStyle}
        >
          Guardar traslado
        </Button>
      </div>
    </motion.form>
  )
}
