import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { RadarChartOutlined } from "@ant-design/icons"

export default function RadiologyStudyPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Estudio radiólogo"
      icon={<RadarChartOutlined />}
    />
  )
}
