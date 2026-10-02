import { Suspense } from "react"
import MedicationApplicationContainer from "../../../container/care/medicationApplication"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function MedicationApplicationPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <MedicationApplicationContainer key={searchParams.admissionId ?? "sin-paciente"} />
    </Suspense>
  )
}
