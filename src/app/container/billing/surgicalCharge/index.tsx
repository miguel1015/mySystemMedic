"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { MedicineBoxOutlined } from "@ant-design/icons"
import { Button, Select } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import ConceptsTable from "./conceptsTable"
import PatientInfoCard from "./patientInfoCard"
import PatientPicker from "./patientPicker"
import PreliquidationModal from "./preliquidationModal"
import SurgicalServiceModal from "./surgicalServiceModal"
import { surgicalWayTypeOptions } from "./constants"
import { useSurgicalChargeForm } from "./useSurgicalChargeForm"

const SurgicalChargeContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const admissionIdParam = searchParams.get("admissionId")
  const admissionId = admissionIdParam ? Number(admissionIdParam) : null

  if (!admissionId) {
    return (
      <Container fluid padding="md">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <MedicineBoxOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Cargue de cirugía</Title>
        </div>
        <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 20, marginTop: -8 }}>
          Selecciona un paciente admitido para iniciar el cargue de una cirugía
        </p>
        <PatientPicker />
      </Container>
    )
  }

  return <SurgicalChargeFlow admissionId={admissionId} onBack={() => router.push("/billing/surgicalCharge")} />
}

const SurgicalChargeFlow = ({ admissionId, onBack }: { admissionId: number; onBack: () => void }) => {
  const { data: admission, isLoading: isLoadingAdmission } = useGetAdmissionById(admissionId)
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(admission?.patientId ?? null)

  const form = useSurgicalChargeForm(admissionId)

  const tariffOptions = form.tariffs.map((t) => ({ value: t.id!, label: t.name }))
  const accessRouteOptions = form.accessRoutes.map((r) => ({ value: r.id, label: r.name }))
  const doctorOptions = form.doctors.map((d) => ({ value: d.id, label: d.fullName }))

  return (
    <Container fluid padding="md">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MedicineBoxOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Cargue de cirugía</Title>
        </div>
        <Button onClick={onBack}>Volver al listado de pacientes</Button>
      </div>
      <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 20, marginTop: -8 }}>
        Selecciona el tarifario, el servicio quirúrgico y los datos de la cirugía para preliquidar y cargarla
      </p>

      <PatientInfoCard
        admission={admission}
        patient={patient}
        loading={isLoadingAdmission || isLoadingPatient}
      />

      <div
        style={{
          border: "1px solid var(--dash-border, #e5e7eb)",
          borderRadius: 8,
          background: "var(--dash-surface, #ffffff)",
          padding: 18,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Tarifario quirúrgico
            </label>
            <Select
              value={form.tariffId ?? undefined}
              onChange={(value) => form.handleSelectTariff(value ?? null)}
              options={tariffOptions}
              loading={form.loadingTariffs}
              placeholder="Seleccione el tarifario"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Servicio a cargar
            </label>
            <Button
              block
              disabled={!form.tariffId}
              onClick={() => form.setServiceModalOpen(true)}
              title={
                form.selectedService
                  ? `${form.selectedService.code} - ${form.selectedService.name}`
                  : undefined
              }
              style={{ display: "flex", overflow: "hidden" }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {form.selectedService
                  ? `${form.selectedService.code} - ${form.selectedService.name}`
                  : "Seleccione el servicio a cargar"}
              </span>
            </Button>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Tipo de vía de la cirugía
            </label>
            <Select
              value={form.surgicalWayType ?? undefined}
              onChange={(value) => form.setSurgicalWayType(value ?? null)}
              options={surgicalWayTypeOptions}
              placeholder="Seleccione el tipo de vía"
              allowClear
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Vía de acceso
            </label>
            <Select
              value={form.accessRouteId ?? undefined}
              onChange={(value) => form.setAccessRouteId(value ?? null)}
              options={accessRouteOptions}
              loading={form.loadingAccessRoutes}
              placeholder="Seleccione la vía de acceso"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Médico especialista
            </label>
            <Select
              value={form.doctorId ?? undefined}
              onChange={(value) => form.setDoctorId(value ?? null)}
              options={doctorOptions}
              loading={form.loadingDoctors}
              placeholder={form.specialty ? "Seleccione el médico" : "Seleccione primero la especialidad"}
              disabled={!form.specialty}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" disabled={!form.canFetchConcepts} onClick={form.fetchConcepts}>
            Traer conceptos
          </Button>
        </div>
      </div>

      {form.concepts.length > 0 && (
        <ConceptsTable
          concepts={form.concepts}
          selectedIds={form.selectedConceptIds}
          onSelectedIdsChange={form.setSelectedConceptIds}
          onClose={form.closeConcepts}
          onAnnex={form.annexConcepts}
          canAnnex={form.canAnnex}
        />
      )}

      {form.canPreliquidate && (
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" onClick={() => form.setPreliquidationOpen(true)}>
            Preliquidar conceptos
          </Button>
        </div>
      )}

      <SurgicalServiceModal
        open={form.serviceModalOpen}
        onClose={() => form.setServiceModalOpen(false)}
        tariffId={form.tariffId}
        tariffDetails={form.tariffDetails}
        profiles={form.profiles}
        loadingProfiles={form.loadingProfiles}
        specialty={form.specialty}
        onSpecialtyChange={form.setSpecialty}
        onSelect={form.handleSelectService}
      />

      <PreliquidationModal
        open={form.preliquidationOpen}
        onClose={() => form.setPreliquidationOpen(false)}
        service={form.selectedService}
        concepts={form.preliquidatedConcepts}
        isSaving={form.isSaving}
        onAccept={() => form.acceptPreliquidation(onBack)}
      />
    </Container>
  )
}

export default SurgicalChargeContainer
