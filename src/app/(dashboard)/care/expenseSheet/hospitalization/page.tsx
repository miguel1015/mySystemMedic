import { Suspense } from "react"
import HospitalizationExpenseSheet from "../../../../container/care/hospitalizationExpenseSheet"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function HospitalizationExpenseSheetPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <HospitalizationExpenseSheet key={searchParams.admissionId} />
    </Suspense>
  )
}
