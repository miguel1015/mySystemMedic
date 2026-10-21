import { Suspense } from "react"
import MedicationPosContainer from "../../../container/care/medicationPos"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function MedicationPosPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <MedicationPosContainer key={searchParams.admissionId} />
    </Suspense>
  )
}
