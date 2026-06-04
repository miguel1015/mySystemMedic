import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { HistoryOutlined } from "@ant-design/icons"

export default function EvolutionsPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Evoluciones"
      icon={<HistoryOutlined />}
    />
  )
}
