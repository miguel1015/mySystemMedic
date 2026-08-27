"use client"

import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import { useSurgicalAccessRoutes } from "@/core/hooks/parameterization/surgicalAccessRoutes/useGetAllSurgicalAccessRoutes"
import { useUserProfiles } from "@/core/hooks/users/useProfile"
import { useGetUsersByProfile } from "@/core/hooks/users/useGetUsersByProfile"
import { useCreateSurgicalCharge } from "@/core/hooks/care/surgicalCharges/useCreateSurgicalCharge"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import {
  SurgicalChargeConceptInput,
  SurgicalWayType,
} from "@/core/interfaces/care/surgicalCharge"
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
  rawValue: number
  roundedValue: number
  percentageApplied: number
  percentageValue: number
}

const PERCENTAGE_APPLIED_DEFAULT = 100

export function useSurgicalChargeForm(admissionId: number) {
  const { data: tariffs, isLoading: loadingTariffs } = useTariffs()
  const { data: tariffDetails, isLoading: loadingTariffDetails } = useTariffDetails()
  const { data: accessRoutes, isLoading: loadingAccessRoutes } = useSurgicalAccessRoutes()
  const { data: profiles, isLoading: loadingProfiles } = useUserProfiles()

  const [tariffId, setTariffId] = useState<number | null>(null)
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedSurgicalService | null>(null)
  const [surgicalWayType, setSurgicalWayType] = useState<SurgicalWayType | null>(null)
  const [accessRouteId, setAccessRouteId] = useState<number | null>(null)
  const [doctorId, setDoctorId] = useState<number | null>(null)

  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [preliquidationOpen, setPreliquidationOpen] = useState(false)

  const [concepts, setConcepts] = useState<TTariffDetail[]>([])
  const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([])
  const [annexedConcepts, setAnnexedConcepts] = useState<TTariffDetail[]>([])

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
    if (!canFetchConcepts || !selectedService || !tariffDetails) return

    const matches = tariffDetails.filter(
      (detail) =>
        detail.tariffId === tariffId && detail.surgicalGroupId === selectedService.surgicalGroupId,
    )

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

  const createSurgicalCharge = useCreateSurgicalCharge()

  const acceptPreliquidation = (onDone: () => void) => {
    if (!selectedService || !tariffId || !specialty || !surgicalWayType || !accessRouteId || !doctorId) {
      toast.error("Falta información obligatoria para cargar la cirugía.")
      return
    }

    const doctor = doctors?.find((d) => d.id === doctorId)
    const accessRoute = accessRoutes?.find((a) => a.id === accessRouteId)

    const conceptsPayload: SurgicalChargeConceptInput[] = preliquidatedConcepts.map((c) => ({
      tariffDetailId: c.id,
      referenceCode: c.referenceCode,
      description: c.description,
      paymentMethodDescription: c.paymentMethodDescription ?? null,
      baseValue: c.value,
      unit: c.factors,
      rawValue: c.rawValue,
      roundedValue: c.roundedValue,
      percentageApplied: c.percentageApplied,
    }))

    createSurgicalCharge.mutate(
      {
        admissionId,
        tariffId,
        tariffName: selectedTariff?.name ?? null,
        surgicalGroupId: selectedService.surgicalGroupId,
        surgicalGroupQxGroup: selectedService.surgicalGroupQxGroup,
        serviceCode: selectedService.code,
        serviceName: selectedService.name,
        specialty,
        doctorId,
        doctorName: doctor?.fullName ?? "",
        surgicalWayType,
        accessRouteId,
        accessRouteName: accessRoute?.name ?? "",
        concepts: conceptsPayload,
      },
      {
        onSuccess: () => {
          toast.success("Cirugía cargada correctamente al paciente.")
          setPreliquidationOpen(false)
          onDone()
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo cargar la cirugía.")
        },
      },
    )
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

    isSaving: createSurgicalCharge.isPending,
    acceptPreliquidation,
  }
}
