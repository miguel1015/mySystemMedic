import TriageDetail from "@/app/container/care/triage/triageDetail"

interface Props {
  params: { id: string }
}

export default function TriageDetailPage({ params }: Props) {
  return <TriageDetail id={params.id} />
}
