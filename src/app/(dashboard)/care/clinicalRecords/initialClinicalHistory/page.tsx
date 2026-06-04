import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { FileTextOutlined } from "@ant-design/icons"

export default function InitialClinicalHistoryPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Historia clínica inicial"
      icon={<FileTextOutlined />}
    />
  )
}
