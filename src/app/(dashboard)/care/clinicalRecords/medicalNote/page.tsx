import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { FormOutlined } from "@ant-design/icons"

export default function MedicalNotePage() {
  return (
    <ClinicalRecordPlaceholder
      title="Nota médica"
      icon={<FormOutlined />}
    />
  )
}
