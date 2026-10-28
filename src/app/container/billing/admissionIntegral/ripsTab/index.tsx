"use client"

import { RipsIssuesPanel, countRipsIssues } from "@/app/container/billing/rips/RipsIssuesPanel"
import { buildRips, toCie10 } from "@/app/container/billing/rips/buildRips"
import { useRipsSources } from "@/app/container/billing/rips/useRipsSources"
import { useUpdateBillingMovementsBatch } from "@/core/hooks/care/billing/useUpdateBillingMovementsBatch"
import { fetchCupsByCode } from "@/core/hooks/parameterization/cups/useCups"
import { useMedicalDevices } from "@/core/hooks/parameterization/medicalDevices/useGetAllMedicalDevices"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  SaveOutlined,
  UndoOutlined,
} from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, Badge, Button, Descriptions, Empty, Skeleton, Space, Tabs, Tag } from "antd"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { classifyServiceCategoryByCode } from "../serviceLoadingTab/classifyTariffCode"
import CupsRequiredModal, { CupsRequiredItem } from "../serviceLoadingTab/cupsRequiredModal"
import ItemPickerModal, { PickerRow } from "../serviceLoadingTab/itemPickerModal"
import SurgicalMovementEditModal from "../serviceLoadingTab/surgicalMovementEditModal"
import { formatDate, formatDateTime } from "../utils"
import {
  MovementEdit,
  MovementEdits,
  RIPS_CATEGORY_LABELS,
  RIPS_CATEGORY_ORDER,
  applyEdits,
  buildBatchRequest,
  categoryOf,
  validateEdits,
} from "./ripsServiceEdits"
import RipsServicesTable from "./ripsServicesTable"
import { RipsValidationResult, validateRips } from "./validateRips"

export type { RipsValidationResult }

interface RipsTabProps {
  admissionId: number
  readOnly?: boolean
  onValidationChange: (result: RipsValidationResult | null) => void
}

type PickKind = "service" | "medicine" | "supply"

const PICK_TITLES: Record<PickKind, string> = {
  service: "Elegir otro servicio del tarifario",
  medicine: "Elegir otro medicamento",
  supply: "Elegir otro insumo",
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 10,
  padding: "18px 20px",
  marginBottom: 20,
}

function IssueDelta({ label, before, after }: { label: string; before: number; after: number }) {
  const diff = after - before
  const color = diff < 0 ? "success" : diff > 0 ? "error" : "default"
  return (
    <Tag color={color} style={{ padding: "4px 10px", fontSize: 13 }}>
      {label}: {before} → <strong>{after}</strong>{" "}
      {diff !== 0 && (
        <>
          ({diff < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />} {Math.abs(diff)})
        </>
      )}
    </Tag>
  )
}

const RipsTab = ({ admissionId, readOnly = false, onValidationChange }: RipsTabProps) => {
  const queryClient = useQueryClient()
  const {
    admission,
    patient,
    provider,
    movements,
    diagnosticosIngreso,
    diagnosticoEgreso,
    hcProfessional,
    professionals,
    isLoading,
  } = useRipsSources(admissionId)

  const { data: tariffDetails = [], isLoading: isLoadingTariffs } = useTariffDetails()
  const { data: medicines = [], isLoading: isLoadingMedicines } = useMedicines()
  const { data: medicalDevices = [], isLoading: isLoadingDevices } = useMedicalDevices()
  const saveBatch = useUpdateBillingMovementsBatch()

  const [edits, setEdits] = useState<MovementEdits>({})
  const [pickTarget, setPickTarget] = useState<{
    movement: BillingMovementResponse
    kind: PickKind
  } | null>(null)
  const [cupsPending, setCupsPending] = useState<{
    movementId: number
    detail: TTariffDetail
    item: CupsRequiredItem
  } | null>(null)
  const [surgeryEditMovement, setSurgeryEditMovement] = useState<BillingMovementResponse | null>(
    null,
  )
  const [showErrors, setShowErrors] = useState(false)

  // Al cambiar de admisión o al quedar facturada se descartan los cambios sin guardar.
  useEffect(() => {
    setEdits({})
    setShowErrors(false)
  }, [admissionId, readOnly])

  // La validación de completitud de la admisión (la usa la pestaña de Facturación) se
  // calcula con lo guardado.
  useEffect(() => {
    if (isLoading || !admission) return
    onValidationChange(
      validateRips({ admission, diagnosticosIngreso, diagnosticoEgreso, movements }),
    )
  }, [isLoading, admission, diagnosticosIngreso, diagnosticoEgreso, movements, onValidationChange])

  const draftMovements = useMemo(() => applyEdits(movements, edits), [movements, edits])
  const dirtyCount = Object.keys(edits).length
  const rowErrors = useMemo(() => validateEdits(movements, edits), [movements, edits])

  const buildFor = (items: BillingMovementResponse[]) =>
    admission
      ? buildRips({
          // Aún no hay factura: no se compara con el XML (fev undefined) ni se valida el número.
          invoiceNum: "",
          admission,
          patient,
          provider,
          movements: items,
          diagnosticosIngreso,
          diagnosticoEgreso,
          professional: hcProfessional,
        })
      : null

  const savedResult = useMemo(
    () => buildFor(movements),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [admission, patient, provider, movements, diagnosticosIngreso, diagnosticoEgreso, hcProfessional],
  )
  const draftResult = useMemo(
    () => (dirtyCount > 0 ? buildFor(draftMovements) : savedResult),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedResult, draftMovements, dirtyCount],
  )

  const savedCounts = countRipsIssues(savedResult?.missing ?? [])
  const draftCounts = countRipsIssues(draftResult?.missing ?? [])

  // Mismo diagnóstico principal que reporta el RIPS: el de egreso o, si no, el primero de ingreso.
  const principalDiagnosis =
    toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso1) ??
    diagnosticosIngreso.map((d) => toCie10(d.codigo)).find(Boolean) ??
    null

  const movementsByCategory = useMemo(() => {
    const groups = Object.fromEntries(
      RIPS_CATEGORY_ORDER.map((category) => [category, [] as BillingMovementResponse[]]),
    ) as Record<(typeof RIPS_CATEGORY_ORDER)[number], BillingMovementResponse[]>
    for (const movement of draftMovements) groups[categoryOf(movement)].push(movement)
    return groups
  }, [draftMovements])

  const handleEdit = (movementId: number, edit: MovementEdit) => {
    const original = movements.find((item) => item.id === movementId)
    if (!original) return
    setEdits((prev) => {
      const merged: MovementEdit = { ...prev[movementId], ...edit }
      // Se quitan los campos que volvieron a su valor original.
      for (const key of Object.keys(merged) as (keyof MovementEdit)[]) {
        if (merged[key] === original[key]) delete merged[key]
      }
      const next = { ...prev }
      if (Object.keys(merged).length === 0) delete next[movementId]
      else next[movementId] = merged
      return next
    })
  }

  const handlePickItem = (movement: BillingMovementResponse) => {
    if (movement.movementType === "surgery" && movement.conceptDetails) {
      if (edits[movement.id]) {
        toast.error("Guarde o descarte los cambios de esta cirugía antes de abrir su detalle.")
        return
      }
      setSurgeryEditMovement(movement)
      return
    }
    const kind: PickKind =
      movement.movementType === "medicine"
        ? "medicine"
        : movement.movementType === "supply"
          ? "supply"
          : "service"
    setPickTarget({ movement, kind })
  }

  const applyServiceDetail = (movementId: number, detail: TTariffDetail, cupsCode: string) => {
    const serviceCategory = classifyServiceCategoryByCode(String(detail.referenceCode))
    const movement = movements.find((item) => item.id === movementId)
    const isSurgery = movement?.movementType === "surgery"
    handleEdit(movementId, {
      itemId: detail.id,
      itemCode: String(detail.referenceCode),
      name: detail.description,
      unitValue: detail.value,
      // En cirugías se conserva la categoría quirúrgica.
      ...(isSurgery ? {} : { serviceCategory, tipoItem: serviceCategory }),
      cupsCode,
      cupsRipsType: null,
      cupsEnabled: null,
    })
    // Tipo RIPS y vigencia del CUPS: definen la categoría y si el MUV lo acepta.
    fetchCupsByCode(queryClient, cupsCode)
      .then((cups) =>
        handleEdit(movementId, {
          cupsRipsType: cups?.ripsType ?? null,
          cupsEnabled: cups ? cups.isEnabled : null,
        }),
      )
      .catch(() => toast.error("No se pudo consultar el CUPS en la tabla CUPSRips"))
  }

  const pickerRows: PickerRow[] = useMemo(() => {
    if (!pickTarget) return []
    if (pickTarget.kind === "service") {
      return tariffDetails.map((detail) => ({
        id: detail.id,
        code: detail.cupsCode ? `${detail.referenceCode} · ${detail.cupsCode}` : String(detail.referenceCode),
        name: detail.description,
        value: detail.value,
      }))
    }
    if (pickTarget.kind === "medicine") {
      return medicines
        .filter((medicine) => medicine.id != null)
        .map((medicine) => ({
          id: medicine.id as number,
          code: medicine.cum,
          name: medicine.name,
          value: medicine.price,
        }))
    }
    return medicalDevices
      .filter((device) => device.id != null)
      .map((device) => ({
        id: device.id as number,
        code: device.ripsCode,
        name: device.elementName,
        value: device.price ?? 0,
      }))
  }, [pickTarget, tariffDetails, medicines, medicalDevices])

  const pickerLoading =
    pickTarget?.kind === "service"
      ? isLoadingTariffs
      : pickTarget?.kind === "medicine"
        ? isLoadingMedicines
        : isLoadingDevices

  const handleSelectPicked = (row: PickerRow) => {
    if (!pickTarget) return
    const { movement, kind } = pickTarget
    setPickTarget(null)

    if (kind === "service") {
      const detail = tariffDetails.find((item) => item.id === row.id)
      if (!detail) return
      if (!detail.cupsCode) {
        setCupsPending({
          movementId: movement.id,
          detail,
          item: {
            referenceCode: detail.referenceCode,
            description: detail.description,
            serviceCategory: classifyServiceCategoryByCode(String(detail.referenceCode)),
          },
        })
        return
      }
      applyServiceDetail(movement.id, detail, detail.cupsCode)
      return
    }

    if (kind === "medicine") {
      const medicine = medicines.find((item) => item.id === row.id)
      handleEdit(movement.id, {
        itemId: row.id,
        itemCode: row.code,
        name: row.name,
        unitValue: row.value,
        medicinePresentationCode: medicine?.presentationCode ?? null,
      })
      return
    }

    handleEdit(movement.id, {
      itemId: row.id,
      itemCode: row.code,
      name: row.name,
      unitValue: row.value,
    })
  }

  const handleDiscard = () => {
    setEdits({})
    setShowErrors(false)
  }

  const handleSave = () => {
    if (Object.keys(rowErrors).length > 0) {
      setShowErrors(true)
      toast.error("Hay campos con errores. Corríjalos antes de guardar.")
      return
    }
    saveBatch.mutate(
      { admissionId, data: buildBatchRequest(movements, edits) },
      {
        onSuccess: () => {
          toast.success("Cambios guardados correctamente.")
          setEdits({})
          setShowErrors(false)
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudieron guardar los cambios")
        },
      },
    )
  }

  if (isLoading || !admission) {
    return <Skeleton active paragraph={{ rows: 6 }} />
  }

  const episodes = draftResult
    ? [
        ...draftResult.rips.usuarios[0].servicios.urgencias.map((item) => ({ label: "Urgencias", item })),
        ...draftResult.rips.usuarios[0].servicios.hospitalizacion.map((item) => ({
          label: "Hospitalización",
          item,
        })),
      ]
    : []

  const categoryTabs = RIPS_CATEGORY_ORDER.map((category) => {
    const items = movementsByCategory[category]
    const editedInCategory = items.filter((item) => edits[item.id]).length
    return {
      key: category,
      label: (
        <Space size={6}>
          {RIPS_CATEGORY_LABELS[category]}
          <Badge
            count={items.length}
            showZero
            color={items.length > 0 ? "var(--theme-primary, #0F6F5C)" : "#9ca3af"}
          />
          {editedInCategory > 0 && <Badge status="processing" />}
        </Space>
      ),
      children:
        items.length === 0 ? (
          <Empty description={`No hay ${RIPS_CATEGORY_LABELS[category].toLowerCase()} cargados`} />
        ) : (
          <RipsServicesTable
            category={category}
            movements={items}
            edits={edits}
            rowErrors={showErrors ? rowErrors : {}}
            readOnly={readOnly}
            principalDiagnosis={principalDiagnosis}
            hcProfessional={hcProfessional}
            professionals={professionals}
            onEdit={handleEdit}
            onPickItem={handlePickItem}
          />
        ),
    }
  })

  return (
    <div>
      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Información de admisión</h6>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          items={[
            { key: "admissionId", label: "Número de admisión", children: `#${admission.id}` },
            {
              key: "document",
              label: "Documento del paciente",
              children: `${admission.documentTypeCode} ${admission.documentoPatiente}`,
            },
            { key: "patientName", label: "Nombre completo", children: admission.nombrePaciente },
            {
              key: "admissionDate",
              label: "Fecha y hora de admisión",
              children: formatDateTime(admission.admissionDate),
            },
            {
              key: "dischargeDate",
              label: "Fecha de egreso",
              children: diagnosticoEgreso?.fechaEgreso
                ? formatDate(diagnosticoEgreso.fechaEgreso)
                : "Sin egreso registrado",
            },
            {
              key: "contract",
              label: "Contrato / convenio",
              children: admission.convenioNombre || "Sin convenio",
            },
          ]}
        />
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Diagnósticos de ingreso</h6>
        {diagnosticosIngreso.length === 0 ? (
          <Empty description="No hay diagnósticos de ingreso registrados en la historia clínica inicial." />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {diagnosticosIngreso.map((diagnostico) => (
              <Tag key={diagnostico.id} color="blue" style={{ padding: "4px 10px" }}>
                {diagnostico.codigo} — {diagnostico.descripcion}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Diagnósticos de egreso</h6>
        {!diagnosticoEgreso ? (
          <Empty description="No hay diagnóstico de egreso registrado para esta admisión." />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tag color="orange" style={{ padding: "4px 10px" }}>
              {diagnosticoEgreso.codigoDiagnosticoEgreso1} — {diagnosticoEgreso.descripcionDiagnosticoEgreso1}
            </Tag>
            {diagnosticoEgreso.codigoDiagnosticoEgreso2 && (
              <Tag color="orange" style={{ padding: "4px 10px" }}>
                {diagnosticoEgreso.codigoDiagnosticoEgreso2} — {diagnosticoEgreso.descripcionDiagnosticoEgreso2}
              </Tag>
            )}
            {diagnosticoEgreso.codigoDiagnosticoEgreso3 && (
              <Tag color="orange" style={{ padding: "4px 10px" }}>
                {diagnosticoEgreso.codigoDiagnosticoEgreso3} — {diagnosticoEgreso.descripcionDiagnosticoEgreso3}
              </Tag>
            )}
          </div>
        )}
      </div>

      {draftResult && draftResult.missing.length === 0 && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message="Sin errores ni avisos para el RIPS"
        />
      )}
      {draftResult && <RipsIssuesPanel missing={draftResult.missing} style={{ marginBottom: 16 }} />}

      <div style={sectionCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div>
            <h6 style={{ fontWeight: 700, margin: 0 }}>Servicios del RIPS</h6>
            {!readOnly && (
              <small style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
                Presione un código, descripción, profesional, cantidad o valor para corregirlo.
              </small>
            )}
          </div>

          {!readOnly && (
            <Space wrap>
              {dirtyCount > 0 && (
                <>
                  <IssueDelta label="Errores" before={savedCounts.errors} after={draftCounts.errors} />
                  <IssueDelta label="Avisos" before={savedCounts.warnings} after={draftCounts.warnings} />
                </>
              )}
              <Button
                icon={<UndoOutlined />}
                onClick={handleDiscard}
                disabled={dirtyCount === 0 || saveBatch.isPending}
              >
                Descartar
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={dirtyCount === 0}
                loading={saveBatch.isPending}
              >
                Guardar{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
              </Button>
            </Space>
          )}
        </div>

        {readOnly && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="La admisión ya fue facturada: los servicios no se pueden modificar."
          />
        )}

        {dirtyCount > 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`Hay ${dirtyCount} ${dirtyCount === 1 ? "servicio modificado" : "servicios modificados"} sin guardar. Los errores de arriba ya reflejan estos cambios.`}
          />
        )}

        <Tabs size="small" items={categoryTabs} />
      </div>

      {episodes.length > 0 && (
        <div style={sectionCardStyle}>
          <h6 style={{ fontWeight: 700, marginBottom: 6 }}>Estancia (urgencias / hospitalización)</h6>
          <small style={{ display: "block", color: "var(--dash-text-secondary, #6b7280)", marginBottom: 12 }}>
            Datos del episodio: se toman de la admisión y de la nota de egreso, y se corrigen allí.
          </small>
          {episodes.map(({ label, item }) => (
            <Descriptions
              key={`${label}-${item.consecutivo}`}
              bordered
              size="small"
              column={{ xs: 1, md: 3 }}
              style={{ marginBottom: 12 }}
              items={[
                { key: "tipo", label: "Tipo", children: label },
                { key: "ingreso", label: "Ingreso", children: item.fechaInicioAtencion ?? "-" },
                { key: "egreso", label: "Egreso", children: item.fechaEgreso ?? "Sin egreso" },
                { key: "dxIngreso", label: "Dx ingreso", children: item.codDiagnosticoPrincipal ?? "-" },
                { key: "dxEgreso", label: "Dx egreso", children: item.codDiagnosticoPrincipalE ?? "-" },
                {
                  key: "condicion",
                  label: "Condición de egreso",
                  children: item.condicionDestinoUsuarioEgreso ?? "-",
                },
              ]}
            />
          ))}
        </div>
      )}

      {pickTarget && (
        <ItemPickerModal
          open={!!pickTarget}
          title={PICK_TITLES[pickTarget.kind]}
          loading={pickerLoading}
          items={pickerRows}
          actionLabel="Elegir"
          onClose={() => setPickTarget(null)}
          onSelect={handleSelectPicked}
        />
      )}

      <CupsRequiredModal
        item={cupsPending?.item ?? null}
        onCancel={() => setCupsPending(null)}
        onAssigned={(cupsCode) => {
          if (cupsPending) applyServiceDetail(cupsPending.movementId, cupsPending.detail, cupsCode)
          setCupsPending(null)
        }}
      />

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

export default RipsTab
