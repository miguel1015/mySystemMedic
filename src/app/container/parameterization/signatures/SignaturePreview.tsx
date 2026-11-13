"use client"

import { DoctorSignatureBox } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import styles from "./signatures.module.scss"

interface Props {
  imageData: string | null
  name: string
}

/**
 * Muestra la firma tal como sale en los documentos clínicos: usa el mismo bloque de firma
 * (DoctorSignatureBox) y la misma altura que la historia clínica impresa.
 */
export default function SignaturePreview({ imageData, name }: Props) {
  return (
    <div>
      <span className={styles.sectionLabel}>Así se verá en los documentos</span>
      <div className={styles.sheet}>
        <div className={styles.sheetCaption} aria-hidden>
          <span>Historia clínica · pie de firma</span>
          <span>Datos de ejemplo</span>
        </div>
        <div className={styles.sheetBox}>
          {imageData ? (
            <DoctorSignatureBox
              doctorName={name.trim() || "Nombre del profesional"}
              doctorUser={{
                signature: imageData,
                userProfileName: "Perfil del usuario",
                licenseCard: "000000",
              }}
            />
          ) : (
            <div className="hci-print-signature-box">
              <div className={styles.sheetEmpty}>La firma aparecerá aquí</div>
              <div className="hci-print-signature-line">{name.trim() || "Nombre del profesional"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
