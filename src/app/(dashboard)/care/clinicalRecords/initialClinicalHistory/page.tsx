import InitialClinicalHistoryContainer from "@/app/container/care/clinicalRecords/initialClinicalHistory"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function InitialClinicalHistoryPage({ searchParams }: PageProps) {
  return <InitialClinicalHistoryContainer key={searchParams.admissionId} />
}
