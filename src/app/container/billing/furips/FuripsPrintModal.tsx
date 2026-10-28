"use client"

import ClinicalPrintPreviewModal from "../../care/clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import type { FuripsDatosSistema, FuripsResponse } from "@/core/interfaces/care/furips"
import type { TCities, TStates } from "@/core/interfaces/user/users"
import { FuripsPrintDocument } from "./FuripsPrintDocument"

interface Props {
  open: boolean
  onClose: () => void
  furips: FuripsResponse | null
  datos: FuripsDatosSistema
  cities: TCities[]
  states: TStates[]
}

export default function FuripsPrintModal({ open, onClose, furips, datos, cities, states }: Props) {
  if (!furips) return null

  return (
    <ClinicalPrintPreviewModal
      open={open}
      onClose={onClose}
      title="Vista previa FURIPS"
      renderDocument={(provider) => (
        <FuripsPrintDocument
          provider={provider}
          furips={furips}
          datos={datos}
          cities={cities}
          states={states}
        />
      )}
    />
  )
}
