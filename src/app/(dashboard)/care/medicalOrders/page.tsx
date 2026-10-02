import { Suspense } from "react"
import MedicalOrdersContainer from "../../../container/care/medicalOrders"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function MedicalOrdersPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <MedicalOrdersContainer key={searchParams.admissionId} />
    </Suspense>
  )
}
