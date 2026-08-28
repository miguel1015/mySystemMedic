"use client"

import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import { useSurgicalAccessRoutes } from "@/core/hooks/parameterization/surgicalAccessRoutes/useGetAllSurgicalAccessRoutes"
import { useSurgicalGroupConcepts } from "@/core/hooks/parameterization/surgicalGroupConcepts/useGetAllSurgicalGroupConcepts"
import { useUserProfiles } from "@/core/hooks/users/useProfile"
import { useGetUsersByProfile } from "@/core/hooks/users/useGetUsersByProfile"
import { useCreateBillingMovement } from "@/core/hooks/care/billing/useCreateBillingMovement"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import { SURGICAL_CONCEPT_TYPES } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { SurgicalWayType } from "@/core/interfaces/care/surgicalCharge"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { roundToNearestHundred } from "./utils"

export interface SelectedSurgicalService {
  tariffDetailId: number
  code: number
  name: string
  surgicalGroupId: number
  surgicalGroupQxGroup: string | null
}

export interface PreliquidatedConcept extends TTariffDetail {
  conceptType: string
  rawValue: number
  roundedValue: number
  percentageApplied: number
  percentageValue: number
}

const PERCENTAGE_APPLIED_DEFAULT = 100

const ALLOWED_SURGICAL_SPECIALTIES = ["ortopedista", "cirujano general"]

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()

export function useSurgicalChargeForm(admissionId: number, admission: AdmissionResponse | undefined) {
  const { data: tariffs, isLoading: loadingTariffs } = useTariffs()
  const { data: tariffDetails, isLoading: loadingTariffDetails } = useTariffDetails()
  const { data: accessRoutes, isLoading: loadingAccessRoutes } = useSurgicalAccessRoutes()
  const { data: allProfiles, isLoading: loadingProfiles } = useUserProfiles()
  const { data: surgicalGroupConcepts } = useSurgicalGroupConcepts()

  const profiles = useMemo(
    () =>
      (allProfiles ?? []).filter((p) => ALLOWED_SURGICAL_SPECIALTIES.includes(normalize(p.name))),
    [allProfiles],
  )

  const [tariffId, setTariffId] = useState<number | null>(null)
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedSurgicalService | null>(null)
  const [surgicalWayType, setSurgicalWayType] = useState<SurgicalWayType | null>(null)
  const [accessRouteId, setAccessRouteId] = useState<number | null>(null)
  const [doctorId, setDoctorId] = useState<number | null>(null)

  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [preliquidationOpen, setPreliquidationOpen] = useState(false)

  const [concepts, setConcepts] = useState<(TTariffDetail & { conceptType: string })[]>([])
  const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([])
  const [annexedConcepts, setAnnexedConcepts] = useState<(TTariffDetail & { conceptType: string })[]>([])

  const { data: doctors, isLoading: loadingDoctors } = useGetUsersByProfile(specialty ?? "")

  const selectedTariff = useMemo(
    () => tariffs?.find((t) => t.id === tariffId) ?? null,
    [tariffs, tariffId],
  )

  const canFetchConcepts = Boolean(
    tariffId && selectedService && specialty && surgicalWayType && accessRouteId && doctorId,
  )

  const canAnnex = concepts.length > 0 && selectedConceptIds.length > 0
  const canPreliquidate = annexedConcepts.length > 0

  const resetService = () => {
    setSelectedService(null)
    setConcepts([])
    setSelectedConceptIds([])
    setAnnexedConcepts([])
  }

  const resetForm = () => {
    setTariffId(null)
    setSpecialty(null)
    setSurgicalWayType(null)
    setAccessRouteId(null)
    setDoctorId(null)
    resetService()
  }

  const handleSelectTariff = (id: number | null) => {
    setTariffId(id)
    resetService()
  }

  const handleSelectService = (service: SelectedSurgicalService) => {
    setSelectedService(service)
    setConcepts([])
    setSelectedConceptIds([])
    setAnnexedConcepts([])
    setServiceModalOpen(false)
  }

  const fetchConcepts = () => {
    if (!canFetchConcepts || !selectedService || !tariffId) return

    const qxGroup = selectedService.surgicalGroupQxGroup

    const matches: (TTariffDetail & { conceptType: string })[] = []

    for (const { value: conceptType, label } of SURGICAL_CONCEPT_TYPES) {
      const concept = (surgicalGroupConcepts ?? []).find(
        (c) => c.surgicalGroupId === selectedService.surgicalGroupId && c.conceptType === conceptType,
      )
      if (!concept) continue

      const displayName = qxGroup ? `${label} - ${qxGroup}` : label

      matches.push({
        id: concept.id,
        referenceCode: concept.code,
        description: displayName,
        value: concept.approxValue,
        isSurgicalProcedure: false,
        factors: 1,
        tariffId,
        tariffName: selectedTariff?.name,
        surgicalGroupId: concept.surgicalGroupId ?? selectedService.surgicalGroupId,
        surgicalGroupQxGroup: concept.surgicalGroupQxGroup ?? qxGroup ?? undefined,
        paymentMethodDescription: displayName,
        conceptType,
      })
    }

    setConcepts(matches)
    setSelectedConceptIds(matches.map((m) => m.id))
    setAnnexedConcepts([])
  }

  const closeConcepts = () => {
    setConcepts([])
    setSelectedConceptIds([])
  }

  const annexConcepts = () => {
    const chosen = concepts.filter((c) => selectedConceptIds.includes(c.id))
    setAnnexedConcepts(chosen)
    toast.success("Conceptos anexados correctamente.")
  }

  const preliquidatedConcepts: PreliquidatedConcept[] = useMemo(
    () =>
      annexedConcepts.map((concept) => {
        const rawValue = concept.value * concept.factors
        const roundedValue = roundToNearestHundred(rawValue)
        const percentageApplied = PERCENTAGE_APPLIED_DEFAULT
        const percentageValue = (roundedValue * percentageApplied) / 100
        return { ...concept, rawValue, roundedValue, percentageApplied, percentageValue }
      }),
    [annexedConcepts],
  )

  const createMovement = useCreateBillingMovement()
  const [isSaving, setIsSaving] = useState(false)

  const acceptPreliquidation = async () => {
    if (!selectedService || !tariffId || !specialty || !surgicalWayType || !accessRouteId || !doctorId) {
      toast.error("Falta información obligatoria para cargar la cirugía.")
      return
    }

    if (!admission?.convenioId) {
      toast.error("La admisión no tiene un convenio asociado para cargar la cirugía.")
      return
    }

    const doctor = doctors?.find((d) => d.id === doctorId)
    const accessRoute = accessRoutes?.find((a) => a.id === accessRouteId)

    const notes = [
      `Cirugía: ${selectedService.code} - ${selectedService.name}`,
      `Vía: ${surgicalWayType}`,
      `Acceso: ${accessRoute?.name ?? ""}`,
      `Especialidad: ${specialty}`,
      `Médico: ${doctor?.fullName ?? ""}`,
    ].join(" | ")

    setIsSaving(true)
    try {
      await Promise.all(
        preliquidatedConcepts.map((concept) =>
          createMovement.mutateAsync({
            admissionId,
            movementType: "surgery",
            itemId: concept.id,
            itemCode: String(concept.referenceCode),
            name: concept.description,
            quantity: 1,
            unitValue: concept.percentageValue,
            contractId: admission.convenioId,
            serviceCategory: null,
            conceptType: concept.conceptType,
            notes,
          }),
        ),
      )

      toast.success("Cirugía cargada correctamente al paciente.")
      setPreliquidationOpen(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar la cirugía."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    tariffs: tariffs ?? [],
    loadingTariffs,
    tariffDetails: tariffDetails ?? [],
    loadingTariffDetails,
    accessRoutes: accessRoutes ?? [],
    loadingAccessRoutes,
    profiles: profiles ?? [],
    loadingProfiles,
    doctors: doctors ?? [],
    loadingDoctors,

    tariffId,
    handleSelectTariff,
    specialty,
    setSpecialty,
    selectedService,
    handleSelectService,
    surgicalWayType,
    setSurgicalWayType,
    accessRouteId,
    setAccessRouteId,
    doctorId,
    setDoctorId,

    serviceModalOpen,
    setServiceModalOpen,
    preliquidationOpen,
    setPreliquidationOpen,

    concepts,
    selectedConceptIds,
    setSelectedConceptIds,
    closeConcepts,
    annexConcepts,
    annexedConcepts,
    preliquidatedConcepts,

    canFetchConcepts,
    canAnnex,
    canPreliquidate,
    fetchConcepts,

    isSaving,
    acceptPreliquidation,
  }
}
