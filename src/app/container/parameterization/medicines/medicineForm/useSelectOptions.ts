import { useMeasurementUnits } from "@/core/hooks/utils/useMeasurementUnits"
import { useAdministrationRoutes } from "@/core/hooks/utils/useAdministrationRoutes"
import { usePharmaceuticalForms } from "@/core/hooks/utils/usePharmaceuticalForms"
import { usePresentations } from "@/core/hooks/utils/usePresentations"
import { useMedicineGroups } from "@/core/hooks/utils/useMedicineGroups"

export function useSelectOptions() {
  const { data: measurementUnits, isLoading: loadingUnits } =
    useMeasurementUnits()
  const { data: administrationRoutes, isLoading: loadingRoutes } =
    useAdministrationRoutes()
  const { data: pharmaceuticalForms, isLoading: loadingForms } =
    usePharmaceuticalForms()
  const { data: presentations, isLoading: loadingPresentations } =
    usePresentations()
  const { data: medicineGroups, isLoading: loadingGroups } =
    useMedicineGroups()

  const isLoading =
    loadingUnits ||
    loadingRoutes ||
    loadingForms ||
    loadingPresentations ||
    loadingGroups

  const measurementUnitOptions = (measurementUnits ?? []).map((u) => ({
    value: u.sidamId,
    label: `${u.unitCode} - ${u.description}`,
  }))

  const administrationRouteOptions = (administrationRoutes ?? []).map((r) => ({
    value: r.code,
    label: `${r.code} - ${r.description}`,
  }))

  const pharmaceuticalFormOptions = (pharmaceuticalForms ?? []).map((f) => ({
    value: f.code,
    label: `${f.code} - ${f.description}`,
  }))

  const presentationOptions = (presentations ?? []).map((p) => ({
    value: p.code,
    label: `${p.code} - ${p.description}`,
  }))

  const medicineGroupOptions = (medicineGroups ?? []).map((g) => ({
    value: g.code,
    label: `${g.code} - ${g.description}`,
  }))

  return {
    measurementUnitOptions,
    administrationRouteOptions,
    pharmaceuticalFormOptions,
    presentationOptions,
    medicineGroupOptions,
    isLoading,
  }
}
