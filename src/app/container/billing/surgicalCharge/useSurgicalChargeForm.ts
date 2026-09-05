"use client"

import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import { useSurgicalAccessRoutes } from "@/core/hooks/parameterization/surgicalAccessRoutes/useGetAllSurgicalAccessRoutes"
import { useSurgicalGroupConcepts } from "@/core/hooks/parameterization/surgicalGroupConcepts/useGetAllSurgicalGroupConcepts"
import { useUserProfiles } from "@/core/hooks/users/useProfile"
import { useGetUsersByProfile } from "@/core/hooks/users/useGetUsersByProfile"
import { useCreateBillingMovement } from "@/core/hooks/care/billing/useCreateBillingMovement"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import {
  SURGICAL_CONCEPT_TYPES,
  SurgicalConceptDetail,
  serializeConceptDetails,
} from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { SurgicalWayType } from "@/core/interfaces/care/surgicalCharge"
import { useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { DEFAULT_LIQUIDATION_PERCENTAGE, getSurgicalWayLiquidationPercentage } from "./constants"
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
  rawLabel: string
  rawValue: number
  roundedValue: number
  percentageApplied: number
  percentageValue: number
}

export interface AnnexedProcedure {
  tempId: string
  service: SelectedSurgicalService
  specialty: string
  surgicalWayType: SurgicalWayType
  accessRouteId: number
  accessRouteName: string
  doctorId: number
  doctorName: string
  concepts: (TTariffDetail & { conceptType: string; rawLabel: string })[]
}

export interface PreliquidatedProcedure extends Omit<AnnexedProcedure, "concepts"> {
  concepts: PreliquidatedConcept[]
  total: number
}

const ALLOWED_SURGICAL_SPECIALTIES = ["ortopedista", "cirujano general"]

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g")

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
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

  const [concepts, setConcepts] = useState<(TTariffDetail & { conceptType: string; rawLabel: string })[]>([])
  const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([])
  const [annexedProcedures, setAnnexedProcedures] = useState<AnnexedProcedure[]>([])
  const nextTempIdRef = useRef(0)

  const { data: doctors, isLoading: loadingDoctors } = useGetUsersByProfile(specialty ?? "")

  const selectedTariff = useMemo(
    () => tariffs?.find((t) => t.id === tariffId) ?? null,
    [tariffs, tariffId],
  )

  const canFetchConcepts = Boolean(
    tariffId && selectedService && specialty && surgicalWayType && accessRouteId && doctorId,
  )

  const canAnnex = concepts.length > 0 && selectedConceptIds.length > 0
  const canPreliquidate = annexedProcedures.length > 0

  const resetService = () => {
    setSelectedService(null)
    setConcepts([])
    setSelectedConceptIds([])
  }

  const resetDraft = () => {
    setSpecialty(null)
    setSurgicalWayType(null)
    setAccessRouteId(null)
    setDoctorId(null)
    resetService()
  }

  const resetForm = () => {
    setTariffId(null)
    resetDraft()
  }

  const handleSelectTariff = (id: number | null) => {
    setTariffId(id)
    resetService()
  }

  const handleSelectService = (service: SelectedSurgicalService) => {
    setSelectedService(service)
    setConcepts([])
    setSelectedConceptIds([])
    setServiceModalOpen(false)
  }

  const fetchConcepts = () => {
    if (!canFetchConcepts || !selectedService || !tariffId) return

    const qxGroup = selectedService.surgicalGroupQxGroup

    const matches: (TTariffDetail & { conceptType: string; rawLabel: string })[] = []

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
        rawLabel: label,
      })
    }

    setConcepts(matches)
    setSelectedConceptIds(matches.map((m) => m.id))
  }

  const closeConcepts = () => {
    setConcepts([])
    setSelectedConceptIds([])
  }

  const annexConcepts = () => {
    if (!selectedService || !specialty || !surgicalWayType || !accessRouteId || !doctorId) return

    const chosen = concepts.filter((c) => selectedConceptIds.includes(c.id))
    const accessRouteName = accessRoutes?.find((a) => a.id === accessRouteId)?.name ?? ""
    const doctorName = doctors?.find((d) => d.id === doctorId)?.fullName ?? ""

    const procedure: AnnexedProcedure = {
      tempId: String(nextTempIdRef.current++),
      service: selectedService,
      specialty,
      surgicalWayType,
      accessRouteId,
      accessRouteName,
      doctorId,
      doctorName,
      concepts: chosen,
    }

    setAnnexedProcedures((prev) => [...prev, procedure])
    resetDraft()
    toast.success("Procedimiento anexado correctamente.")
  }

  const removeAnnexedProcedure = (tempId: string) => {
    setAnnexedProcedures((prev) => prev.filter((p) => p.tempId !== tempId))
  }

  const preliquidatedProcedures: PreliquidatedProcedure[] = useMemo(
    () =>
      annexedProcedures.map((procedure, index) => {
        // El primer procedimiento anexado siempre se liquida al 100%, sin importar
        // el tipo de vía seleccionado: esa regla solo aplica desde el segundo en adelante.
        const isFirstProcedure = index === 0

        const preliquidatedConcepts = procedure.concepts.map((concept) => {
          const rawValue = concept.value * concept.factors
          const roundedValue = roundToNearestHundred(rawValue)
          const percentageApplied = isFirstProcedure
            ? DEFAULT_LIQUIDATION_PERCENTAGE
            : getSurgicalWayLiquidationPercentage(procedure.surgicalWayType, concept.conceptType)
          const percentageValue = (roundedValue * percentageApplied) / 100
          return { ...concept, rawValue, roundedValue, percentageApplied, percentageValue }
        })
        const total = preliquidatedConcepts.reduce((sum, c) => sum + c.percentageValue, 0)
        return { ...procedure, concepts: preliquidatedConcepts, total }
      }),
    [annexedProcedures],
  )

  const createMovement = useCreateBillingMovement()
  const [isSaving, setIsSaving] = useState(false)

  const acceptPreliquidation = async () => {
    if (preliquidatedProcedures.length === 0) {
      toast.error("No hay procedimientos anexados para liquidar.")
      return
    }

    if (!admission?.convenioId) {
      toast.error("La admisión no tiene un convenio asociado para cargar la cirugía.")
      return
    }

    setIsSaving(true)
    try {
      for (const procedure of preliquidatedProcedures) {
        const conceptDetails: SurgicalConceptDetail[] = procedure.concepts.map((concept) => ({
          itemId: concept.id,
          conceptType: concept.conceptType,
          code: concept.referenceCode,
          label: concept.rawLabel,
          qxGroup: concept.surgicalGroupQxGroup ?? null,
          unitValue: concept.percentageValue,
          percentageApplied: concept.percentageApplied,
        }))

        const notes = [
          `Cirugía: ${procedure.service.code} - ${procedure.service.name}`,
          `Vía: ${procedure.surgicalWayType}`,
          `Acceso: ${procedure.accessRouteName}`,
          `Especialidad: ${procedure.specialty}`,
          `Médico: ${procedure.doctorName}`,
        ].join(" | ")

        await createMovement.mutateAsync({
          admissionId,
          movementType: "surgery",
          itemId: procedure.service.tariffDetailId,
          itemCode: String(procedure.service.code),
          name: procedure.service.name,
          quantity: 1,
          unitValue: procedure.total,
          contractId: admission.convenioId,
          serviceCategory: null,
          conceptType: null,
          conceptDetails: serializeConceptDetails(conceptDetails),
          notes,
        })

        // Se retira de la lista tan pronto se registra su movimiento, para que un
        // fallo a mitad de camino no vuelva a facturar los procedimientos ya cargados.
        setAnnexedProcedures((prev) => prev.filter((p) => p.tempId !== procedure.tempId))
      }

      toast.success("Cirugías cargadas correctamente al paciente.")
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
    annexedProcedures,
    removeAnnexedProcedure,
    preliquidatedProcedures,

    canFetchConcepts,
    canAnnex,
    canPreliquidate,
    fetchConcepts,

    isSaving,
    acceptPreliquidation,
  }
}
