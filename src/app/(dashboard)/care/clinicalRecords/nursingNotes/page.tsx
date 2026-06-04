import ClinicalRecordPlaceholder from "@/app/container/care/clinicalRecordPlaceholder"
import { MedicineBoxOutlined } from "@ant-design/icons"

export default function NursingNotesPage() {
  return (
    <ClinicalRecordPlaceholder
      title="Notas de enfermería"
      icon={<MedicineBoxOutlined />}
    />
  )
}
