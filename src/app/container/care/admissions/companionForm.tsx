"use client"

import { Button, Col, ConfigProvider, Form, Input, Row, Select, Space, Spin } from "antd"
import { CloseOutlined, SaveOutlined } from "@ant-design/icons"
import { useMemo } from "react"
import toast from "react-hot-toast"
import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  useGetAdmissionCompanion,
  useKinshipTypes,
  useSaveAdmissionCompanion,
} from "@/core/hooks/care/admissions/useAdmissionCompanion"
import type {
  AdmissionCompanionRequest,
  AdmissionCompanionResponse,
} from "@/core/interfaces/care/admissionCompanion"
import type { GetPatient } from "@/core/interfaces/care/types"

// El modal del sistema está en z-index 1055 y los desplegables de antd en 1050: sin esto
// los selects se abren detrás del modal.
const POPUP_Z_INDEX_BASE = 1100

const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/

interface CompanionFormProps {
  admissionId: number
  patientId: number
  onClose: () => void
}

export default function CompanionForm({ admissionId, patientId, onClose }: CompanionFormProps) {
  const { data: companion, isLoading: loadingCompanion } = useGetAdmissionCompanion(admissionId)
  const { data: patient, isLoading: loadingPatient } = useGetPatientById(patientId)

  if (loadingCompanion || loadingPatient) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin />
      </div>
    )
  }

  return (
    <CompanionFormContent
      admissionId={admissionId}
      companion={companion ?? null}
      patient={patient ?? null}
      onClose={onClose}
    />
  )
}

interface ContentProps {
  admissionId: number
  companion: AdmissionCompanionResponse | null
  patient: GetPatient | null
  onClose: () => void
}

function CompanionFormContent({ admissionId, companion, patient, onClose }: ContentProps) {
  const [form] = Form.useForm<AdmissionCompanionRequest>()
  const saveMutation = useSaveAdmissionCompanion()
  const { data: documentTypes = [], isLoading: loadingDocumentTypes } = useUserDocumentType()
  const { data: kinshipTypes = [], isLoading: loadingKinshipTypes } = useKinshipTypes()

  // Sin acompañante registrado, el teléfono y la dirección se sugieren con los del
  // paciente: casi siempre es un familiar que vive con él.
  const initialValues = useMemo<Partial<AdmissionCompanionRequest>>(
    () =>
      companion ?? {
        phone: patient?.phone || undefined,
        address: patient?.address || undefined,
      },
    // Los valores iniciales se calculan una vez por admisión (el `key` del padre lo reinicia).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleSave = async () => {
    let values: AdmissionCompanionRequest
    try {
      values = await form.validateFields()
    } catch {
      toast.error("Revise los campos marcados en el formulario")
      return
    }

    try {
      await saveMutation.mutateAsync({ admissionId, data: values })
      toast.success(companion ? "Acompañante actualizado" : "Acompañante registrado")
      onClose()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <ConfigProvider theme={{ token: { zIndexPopupBase: POPUP_Z_INDEX_BASE } }}>
      <Form<AdmissionCompanionRequest>
        form={form}
        layout="horizontal"
        labelCol={{ xs: 24, sm: 6 }}
        wrapperCol={{ xs: 24, sm: 18 }}
        initialValues={initialValues}
        requiredMark
      >
        <Form.Item label="Documento" required style={{ marginBottom: 0 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              name="documentTypeId"
              rules={[{ required: true, message: "Seleccione el tipo" }]}
              style={{ width: "45%" }}
            >
              <Select
                placeholder="Seleccione"
                loading={loadingDocumentTypes}
                showSearch
                optionFilterProp="label"
                options={documentTypes.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Form.Item>
            <Form.Item
              name="documentNumber"
              rules={[
                { required: true, whitespace: true, message: "Ingrese el documento" },
                { max: 20, message: "Máximo 20 caracteres" },
              ]}
              style={{ width: "55%" }}
            >
              <Input placeholder="Documento" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item label="Nombres" required style={{ marginBottom: 0 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[
                  { required: true, whitespace: true, message: "Ingrese el primer nombre" },
                  { max: 60, message: "Máximo 60 caracteres" },
                ]}
              >
                <Input placeholder="1 Nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="middleName" rules={[{ max: 60, message: "Máximo 60 caracteres" }]}>
                <Input placeholder="2 Nombre" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="Apellidos" required style={{ marginBottom: 0 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[
                  { required: true, whitespace: true, message: "Ingrese el primer apellido" },
                  { max: 60, message: "Máximo 60 caracteres" },
                ]}
              >
                <Input placeholder="1 Apellido" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="secondLastName" rules={[{ max: 60, message: "Máximo 60 caracteres" }]}>
                <Input placeholder="2 Apellido" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          name="kinshipTypeId"
          label="Parentesco"
          rules={[{ required: true, message: "Seleccione el parentesco" }]}
        >
          <Select
            placeholder="Seleccione"
            loading={loadingKinshipTypes}
            showSearch
            optionFilterProp="label"
            options={kinshipTypes.map((k) => ({ value: k.id, label: k.name }))}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: "email", message: "Correo electrónico no válido" },
            { max: 150, message: "Máximo 150 caracteres" },
          ]}
        >
          <Input placeholder="Correo electrónico" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Teléfono"
          rules={[
            { required: true, whitespace: true, message: "Ingrese el teléfono" },
            { pattern: PHONE_PATTERN, message: "Solo números, entre 7 y 20 caracteres" },
          ]}
        >
          <Input placeholder="Teléfono" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Dirección"
          rules={[{ max: 200, message: "Máximo 200 caracteres" }]}
        >
          <Input.TextArea placeholder="Dirección" autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>

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
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saveMutation.isPending}
          >
            Guardar datos
          </Button>
        </div>
      </Form>
    </ConfigProvider>
  )
}
