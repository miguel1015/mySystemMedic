"use client"

import { Button, Col, Form, Input, InputNumber, Row, Select } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect } from "react"
import Modal from "@/components/modal"
import { useUpdateEvolucion } from "@/core/hooks/care/evoluciones/useUpdateEvolucion"
import { useUpdateEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useUpdateEvolucionEspecialista"
import { useGetEspecialidades } from "@/core/hooks/care/clinicalHistory/useClinicalHistory"
import { RECORD_TYPE_LABEL, type EvolutionEntry } from "./clinicalHistory.utils"

interface Props {
  entry: EvolutionEntry | null
  onClose: () => void
  onSaved: () => void
  messageApi: MessageInstance
}

interface FormValues {
  fechaEvolucion: string
  horaEvolucion: string
  especialidadId?: number
  motivoConsulta: string
  plan: string
  tensionArterial?: string | null
  frecuenciaCardiaca?: number | null
  frecuenciaRespiratoria?: number | null
  temperatura?: number | null
  saturacionOxigeno?: number | null
  glasgow?: number | null
  peso?: number | null
  talla?: number | null
}

// La evolución general admite 1000 caracteres por campo; la de especialista, 5000.
const MAX_LENGTH: Record<EvolutionEntry["tipo"], number> = {
  Evolucion: 1000,
  EvolucionEspecialista: 5000,
}

const VITAL_SIGNS: { name: keyof FormValues; label: string; min: number; max: number; step?: number }[] = [
  { name: "frecuenciaCardiaca", label: "FC (lpm)", min: 0, max: 300 },
  { name: "frecuenciaRespiratoria", label: "FR (rpm)", min: 0, max: 100 },
  { name: "temperatura", label: "Temperatura (°C)", min: 0, max: 50, step: 0.1 },
  { name: "saturacionOxigeno", label: "Sat. O₂ (%)", min: 0, max: 100 },
  { name: "glasgow", label: "Glasgow", min: 3, max: 15 },
  { name: "peso", label: "Peso (kg)", min: 0, max: 500, step: 0.1 },
  { name: "talla", label: "Talla (m)", min: 0, max: 3, step: 0.01 },
]

export default function EvolutionEditModal({ entry, onClose, onSaved, messageApi }: Props) {
  const [form] = Form.useForm<FormValues>()
  const { data: especialidades = [] } = useGetEspecialidades()
  const updateEvolucion = useUpdateEvolucion()
  const updateEvolucionEspecialista = useUpdateEvolucionEspecialista()
  const isSaving = updateEvolucion.isPending || updateEvolucionEspecialista.isPending

  useEffect(() => {
    if (!entry) return
    form.resetFields()
    form.setFieldsValue({
      ...entry.data,
      horaEvolucion: entry.data.horaEvolucion?.slice(0, 8),
      especialidadId: entry.data.especialidadId ?? undefined,
    })
  }, [entry, form])

  if (!entry) return null
  const maxLength = MAX_LENGTH[entry.tipo]

  const handleSave = async () => {
    const values = await form.validateFields()
    const base = {
      fechaEvolucion: values.fechaEvolucion,
      horaEvolucion: values.horaEvolucion.length === 5 ? `${values.horaEvolucion}:00` : values.horaEvolucion,
      especialidadId: values.especialidadId,
      motivoConsulta: values.motivoConsulta.trim(),
      plan: values.plan.trim(),
      isActive: true,
    }

    try {
      if (entry.tipo === "Evolucion") {
        await updateEvolucion.mutateAsync({
          id: entry.data.id,
          data: {
            ...base,
            tensionArterial: values.tensionArterial?.trim() || null,
            frecuenciaCardiaca: values.frecuenciaCardiaca ?? null,
            frecuenciaRespiratoria: values.frecuenciaRespiratoria ?? null,
            temperatura: values.temperatura ?? null,
            saturacionOxigeno: values.saturacionOxigeno ?? null,
            glasgow: values.glasgow ?? null,
            peso: values.peso ?? null,
            talla: values.talla ?? null,
          },
        })
      } else {
        await updateEvolucionEspecialista.mutateAsync({ id: entry.data.id, data: base })
      }
      messageApi.success(`${RECORD_TYPE_LABEL[entry.tipo]} modificada correctamente`)
      onSaved()
      onClose()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo modificar la evolución.")
    }
  }

  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      size="lg"
      title={`Modificar ${RECORD_TYPE_LABEL[entry.tipo].toLowerCase()} · ${entry.data.nombreProfesional}`}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={isSaving} onClick={handleSave}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <Form form={form} layout="vertical" requiredMark>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="fechaEvolucion" label="Fecha" rules={[{ required: true, message: "La fecha es obligatoria." }]}>
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="horaEvolucion" label="Hora" rules={[{ required: true, message: "La hora es obligatoria." }]}>
              <Input type="time" step={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item name="especialidadId" label="Especialidad">
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Especialidad"
                options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="motivoConsulta"
          label="Motivo de consulta"
          rules={[{ required: true, whitespace: true, message: "El motivo de consulta es obligatorio." }]}
        >
          <Input.TextArea rows={4} maxLength={maxLength} showCount />
        </Form.Item>

        {entry.tipo === "Evolucion" && (
          <Row gutter={12}>
            <Col xs={12} md={6}>
              <Form.Item name="tensionArterial" label="TA">
                <Input maxLength={20} placeholder="120/80" />
              </Form.Item>
            </Col>
            {VITAL_SIGNS.map((v) => (
              <Col xs={12} md={6} key={v.name}>
                <Form.Item name={v.name} label={v.label}>
                  <InputNumber min={v.min} max={v.max} step={v.step ?? 1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            ))}
          </Row>
        )}

        <Form.Item
          name="plan"
          label="Plan"
          rules={[{ required: true, whitespace: true, message: "El plan es obligatorio." }]}
        >
          <Input.TextArea rows={4} maxLength={maxLength} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
