import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { LogoutOutlined } from "@ant-design/icons"

export default function DischargeNotePage() {
  return (
    <ClinicalRecordPlaceholder
      title="Nota de egreso"
      icon={<LogoutOutlined />}
    />
  )
}
