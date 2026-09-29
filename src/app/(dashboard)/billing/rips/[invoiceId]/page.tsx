import RipsDetail from "@/app/container/billing/rips"

interface Props {
  params: { invoiceId: string }
}

export default function RipsDetailPage({ params }: Props) {
  return <RipsDetail invoiceId={Number(params.invoiceId)} />
}
