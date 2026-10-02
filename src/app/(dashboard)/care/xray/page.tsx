import { Suspense } from "react"
import XrayContainer from "../../../container/care/xray"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function XrayPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <XrayContainer key={searchParams.admissionId} />
    </Suspense>
  )
}
