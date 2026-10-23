import { Suspense } from "react"
import AnesthesiaRecordContainer from "../../../container/care/anesthesiaRecord"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function AnesthesiaRecordPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <AnesthesiaRecordContainer key={searchParams.admissionId} />
    </Suspense>
  )
}
