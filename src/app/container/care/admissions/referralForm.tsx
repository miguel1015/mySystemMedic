"use client"

import { Button, Col, ConfigProvider, DatePicker, Form, Input, Row, Select, Spin } from "antd"
import { CloseOutlined, PrinterOutlined, SaveOutlined } from "@ant-design/icons"
import dayjs, { type Dayjs } from "dayjs"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import ClinicalPrintPreviewModal from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import { buildPrintPatient } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useCities } from "@/core/hooks/utils/useCities"
import { useGetProfessionals } from "@/core/hooks/users/useGetProfessionals"
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  useGetAdmissionReferral,
  useSaveAdmissionReferral,
} from "@/core/hooks/care/admissions/useAdmissionReferral"
import type {
  AdmissionReferralRequest,
  AdmissionReferralResponse,
} from "@/core/interfaces/care/admissionReferral"
import type { AdmissionResponse } from "@/core/interfaces/care/types"
import type { GetUser } from "@/core/interfaces/user/users"
import { ReferralPrintDocument } from "./ReferralPrintDocument"

// El modal del sistema está en z-index 1055 y los desplegables de antd en 1050: sin esto
// los selects y calendarios se abren detrás del modal.
const POPUP_Z_INDEX_BASE = 1100

type ReferralFormValues = Omit<AdmissionReferralRequest, "fechaRemision"> & {
  fechaRemision?: Dayjs | null
}

interface ReferralFormProps {
  admission: AdmissionResponse
  onClose: () => void
}

export default function ReferralForm({ admission, onClose }: ReferralFormProps) {
  const { data: referral, isLoading: loadingReferral } = useGetAdmissionReferral(admission.id)
  const { data: provider, isLoading: loadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const { data: cities = [], isLoading: loadingCities } = useCities()

  if (loadingReferral || loadingProvider || loadingCities) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin />
      </div>
    )
  }

  // La IPS que recibe la remisión es esta institución (Datos IPS).
  const ipsRecibe = {
    ipsRecibeNombre: provider?.name,
    ipsRecibeTelefono: provider?.phone,
    ipsRecibeCiudad: cities.find((c) => c.id === provider?.cityId)?.name,
    ipsRecibeDireccion: provider?.address,
  }

  return (
    <ReferralFormContent
      admission={admission}
      referral={referral ?? null}
      ipsRecibe={ipsRecibe}
      onClose={onClose}
    />
  )
}

interface ContentProps {
  admission: AdmissionResponse
  referral: AdmissionReferralResponse | null
  ipsRecibe: Partial<ReferralFormValues>
  onClose: () => void
}

function ReferralFormContent({ admission, referral, ipsRecibe, onClose }: ContentProps) {
  const [form] = Form.useForm<ReferralFormValues>()
  const saveMutation = useSaveAdmissionReferral()
  const { data: professionals = [], isLoading: loadingProfessionals } = useGetProfessionals()
  const [printRecord, setPrintRecord] = useState<AdmissionReferralResponse | null>(null)

  const initialValues = useMemo<Partial<ReferralFormValues>>(
    () =>
      referral
        ? { ...referral, fechaRemision: dayjs(referral.fechaRemision) }
        : { ...ipsRecibe, fechaRemision: dayjs() },
    // Los valores iniciales se calculan una vez por admisión (el `key` del padre lo reinicia).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const save = async (): Promise<AdmissionReferralResponse | null> => {
    let values: ReferralFormValues
    try {
      values = await form.validateFields()
    } catch {
      toast.error("Revise los campos marcados en el formulario")
      return null
    }

    try {
      const saved = await saveMutation.mutateAsync({
        admissionId: admission.id,
        data: { ...values, fechaRemision: values.fechaRemision!.format("YYYY-MM-DD") },
      })
      toast.success(referral ? "Remisión actualizada" : "Remisión registrada")
      return saved
    } catch (error) {
      toast.error((error as Error).message)
      return null
    }
  }

  const handleSave = async () => {
    if (await save()) onClose()
  }

  // Imprimir lo ya guardado no modifica el registro: solo se guarda si hay cambios.
  const handlePrint = async () => {
    if (referral && !form.isFieldsTouched()) {
      setPrintRecord(referral)
      return
    }
    const saved = await save()
    if (saved) setPrintRecord(saved)
  }

  const required = (message: string) => [{ required: true, whitespace: true, message }]

  return (
    <ConfigProvider theme={{ token: { zIndexPopupBase: POPUP_Z_INDEX_BASE } }}>
      <Form<ReferralFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark
      >
        <h6 style={{ fontWeight: 600, marginBottom: 12 }}>IPS que remite al paciente</h6>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="ipsRemiteNombre"
              label="Nombre IPS que remite"
              rules={required("Indique la IPS que remite")}
            >
              <Input maxLength={200} placeholder="Nombre de la IPS externa" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="ipsRemiteNit" label="NIT" rules={required("Indique el NIT")}>
              <Input maxLength={20} placeholder="NIT de la IPS" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="fechaRemision"
              label="Fecha de remisión"
              rules={[{ required: true, message: "Indique la fecha de remisión" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={(d) => d.isAfter(dayjs(), "day")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="ipsRemiteTelefono"
              label="Teléfono"
              rules={required("Indique el teléfono")}
            >
              <Input maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="ipsRemiteCiudad" label="Ciudad" rules={required("Indique la ciudad")}>
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="ipsRemiteDireccion"
              label="Dirección"
              rules={required("Indique la dirección")}
            >
              <Input maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="personaRemite"
              label="Persona que remite"
              rules={required("Indique quién remite")}
            >
              <Input maxLength={200} placeholder="Nombre de quien remitió" />
            </Form.Item>
          </Col>
        </Row>

        <h6 style={{ fontWeight: 600, margin: "8px 0 12px" }}>
          Persona remitida a (IPS que recibe, normalmente esta institución)
        </h6>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="ipsRecibeNombre"
              label="Nombre IPS que recibe"
              rules={required("Indique la IPS que recibe")}
            >
              <Input maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="ipsRecibeTelefono" label="Teléfono">
              <Input maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="ipsRecibeCiudad" label="Ciudad">
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="ipsRecibeDireccion" label="Dirección">
              <Input maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="medicoRecibeUserId"
              label="Persona que recibe (médico)"
              rules={[{ required: true, message: "Seleccione el médico que recibe" }]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="— Seleccione médico —"
                loading={loadingProfessionals}
                options={professionals.map((p) => ({
                  value: p.id,
                  label: p.userProfileName ? `${p.fullName} — ${p.userProfileName}` : p.fullName,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid var(--theme-border, #f0f0f0)",
            paddingTop: 16,
          }}
        >
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Cerrar
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={saveMutation.isPending}
            style={{ background: "#0f766e", color: "#fff", borderColor: "#0f766e" }}
          >
            Imprimir remisión
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saveMutation.isPending}
          >
            Guardar datos
          </Button>
        </div>
      </Form>

      <ReferralPrintModal
        admission={admission}
        referral={printRecord}
        onClose={() => setPrintRecord(null)}
      />
    </ConfigProvider>
  )
}

function ReferralPrintModal({
  admission,
  referral,
  onClose,
}: {
  admission: AdmissionResponse
  referral: AdmissionReferralResponse | null
  onClose: () => void
}) {
  const { data: patient } = useGetPatientById(referral ? admission.patientId : null)
  const { data: doctor } = useGetUserById(referral?.medicoRecibeUserId ?? 0)

  if (!referral) return null

  return (
    <ClinicalPrintPreviewModal
      open
      onClose={onClose}
      title="Vista previa remisión"
      renderDocument={(provider) => (
        <ReferralPrintDocument
          provider={provider}
          patient={buildPrintPatient(admission, patient)}
          admission={admission}
          referral={referral}
          doctorUser={doctor ? ({ ...doctor, id: referral.medicoRecibeUserId } as GetUser) : undefined}
        />
      )}
    />
  )
}
