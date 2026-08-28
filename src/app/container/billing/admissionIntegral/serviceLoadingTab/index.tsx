"use client"

import Modal from "@/components/modal"
import { useMedicalDevices } from "@/core/hooks/parameterization/medicalDevices/useGetAllMedicalDevices"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import {
  BILLING_SERVICE_CATEGORIES,
  BillingMovementResponse,
  BillingMovementType,
} from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import {
  ExperimentOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
} from "@ant-design/icons"
import { Button } from "antd"
import { useMemo, useState } from "react"
import ItemPickerModal, { PickerRow } from "./itemPickerModal"
import MovementForm from "./movementForm"
import { MovementDraft } from "./movementForm/useMovementForm"
import SurgicalMovementEditModal from "./surgicalMovementEditModal"
import MovementsTable from "./table"

interface ServiceLoadingTabProps {
  admission: AdmissionResponse | undefined
  admissionId: number
  movements: BillingMovementResponse[]
  loading: boolean
}

type PickerMovementType = Exclude<BillingMovementType, "surgery">

const PICKER_LABELS: Record<PickerMovementType, string> = {
  service: "Servicios",
  medicine: "Medicamentos",
  supply: "Insumos",
}

const ServiceLoadingTab = ({
  admission,
  admissionId,
  movements,
  loading,
}: ServiceLoadingTabProps) => {
  const { data: tariffDetails = [], isLoading: isLoadingTariffs } = useTariffDetails()
  const { data: medicines = [], isLoading: isLoadingMedicines } = useMedicines()
  const { data: medicalDevices = [], isLoading: isLoadingDevices } = useMedicalDevices()

  const [openPicker, setOpenPicker] = useState<PickerMovementType | null>(null)
  const [draft, setDraft] = useState<MovementDraft | null>(null)
  const [surgeryEditMovement, setSurgeryEditMovement] = useState<BillingMovementResponse | null>(
    null,
  )

  const servicePickerRows: PickerRow[] = useMemo(
    () =>
      tariffDetails.map((detail) => ({
        id: detail.id,
        code: String(detail.referenceCode),
        name: detail.description,
        value: detail.value,
      })),
    [tariffDetails],
  )

  const medicinePickerRows: PickerRow[] = useMemo(
    () =>
      medicines
        .filter((medicine) => medicine.id != null)
        .map((medicine) => ({
          id: medicine.id as number,
          code: medicine.cum,
          name: medicine.name,
          value: medicine.price,
        })),
    [medicines],
  )

  const supplyPickerRows: PickerRow[] = useMemo(
    () =>
      medicalDevices
        .filter((device) => device.id != null)
        .map((device) => ({
          id: device.id as number,
          code: device.ripsCode,
          name: device.elementName,
          value: 0,
        })),
    [medicalDevices],
  )

  const pickerData: Record<PickerMovementType, { rows: PickerRow[]; loading: boolean }> = {
    service: { rows: servicePickerRows, loading: isLoadingTariffs },
    medicine: { rows: medicinePickerRows, loading: isLoadingMedicines },
    supply: { rows: supplyPickerRows, loading: isLoadingDevices },
  }

  const handlePickItem = (movementType: PickerMovementType, row: PickerRow) => {
    setOpenPicker(null)
    setDraft({
      movementType,
      itemId: row.id,
      itemCode: row.code,
      name: row.name,
      quantity: 1,
      unitValue: row.value,
      contractId: admission?.convenioId ?? null,
      serviceCategory: movementType === "service" ? BILLING_SERVICE_CATEGORIES[0] : null,
      conceptType: null,
      conceptDetails: null,
      notes: null,
    })
  }

  const handleEdit = (movement: BillingMovementResponse) => {
    if (movement.movementType === "surgery" && movement.conceptDetails) {
      setSurgeryEditMovement(movement)
      return
    }

    setDraft({
      id: movement.id,
      movementType: movement.movementType,
      itemId: movement.itemId,
      itemCode: movement.itemCode,
      name: movement.name,
      quantity: movement.quantity,
      unitValue: movement.unitValue,
      contractId: movement.contractId,
      serviceCategory: movement.serviceCategory,
      conceptType: movement.conceptType,
      conceptDetails: movement.conceptDetails,
      notes: movement.notes,
    })
  }

  const formTitle = draft?.id
    ? "Editar movimiento"
    : draft && draft.movementType !== "surgery"
      ? `Agregar ${PICKER_LABELS[draft.movementType].toLowerCase()}`
      : ""

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <Button
          size="large"
          icon={<ExperimentOutlined />}
          onClick={() => setOpenPicker("service")}
          disabled={!admission}
        >
          Servicios
        </Button>
        <Button
          size="large"
          icon={<MedicineBoxOutlined />}
          onClick={() => setOpenPicker("medicine")}
          disabled={!admission}
        >
          Medicamentos
        </Button>
        <Button
          size="large"
          icon={<ToolOutlined />}
          onClick={() => setOpenPicker("supply")}
          disabled={!admission}
        >
          Insumos
        </Button>
      </div>

      <MovementsTable
        movements={movements}
        admissionId={admissionId}
        loading={loading}
        onEdit={handleEdit}
      />

      {openPicker && (
        <ItemPickerModal
          open={!!openPicker}
          title={`Consultar y cargar ${PICKER_LABELS[openPicker].toLowerCase()}`}
          loading={pickerData[openPicker].loading}
          items={pickerData[openPicker].rows}
          onClose={() => setOpenPicker(null)}
          onSelect={(row) => handlePickItem(openPicker, row)}
        />
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} size="md">
        <MovementForm
          admissionId={admissionId}
          admission={admission}
          draft={draft}
          title={formTitle}
          onClose={() => setDraft(null)}
          onSaved={() => setDraft(null)}
        />
      </Modal>

      <SurgicalMovementEditModal
        open={!!surgeryEditMovement}
        admissionId={admissionId}
        movement={surgeryEditMovement}
        onClose={() => setSurgeryEditMovement(null)}
        onSaved={() => setSurgeryEditMovement(null)}
      />
    </div>
  )
}

export default ServiceLoadingTab
