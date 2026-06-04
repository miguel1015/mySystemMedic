import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { AuditOutlined } from "@ant-design/icons"

export default function NonSurgicalProceduresPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Procedimientos no quirúrgicos"
      icon={<AuditOutlined />}
    />
  )
}
