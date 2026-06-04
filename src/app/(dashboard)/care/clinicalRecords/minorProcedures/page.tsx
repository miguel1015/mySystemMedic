import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { ToolOutlined } from "@ant-design/icons"

export default function MinorProceduresPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Procedimientos menores"
      icon={<ToolOutlined />}
    />
  )
}
