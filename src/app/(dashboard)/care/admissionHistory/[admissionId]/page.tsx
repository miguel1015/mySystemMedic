import AdmissionRecordContainer from "@/app/container/care/admissionHistory/detail"

export default function AdmissionRecordPage({ params }: { params: { admissionId: string } }) {
  return <AdmissionRecordContainer admissionId={Number(params.admissionId)} />
}
