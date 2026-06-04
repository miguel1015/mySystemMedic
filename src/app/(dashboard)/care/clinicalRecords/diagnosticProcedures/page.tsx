import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { ExperimentOutlined } from "@ant-design/icons"

export default function DiagnosticProceduresPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Procedimientos diagnósticos"
      icon={<ExperimentOutlined />}
    />
  )
}
