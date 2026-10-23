import { Suspense } from "react"
import LabSheetContainer from "../../../container/care/labSheet"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function LabSheetPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <LabSheetContainer key={searchParams.admissionId} />
    </Suspense>
  )
}
