import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { ScissorOutlined } from "@ant-design/icons"

export default function SurgicalDescriptionPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Descripción quirúrgica"
      icon={<ScissorOutlined />}
    />
  )
}
