import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types";

export const formatDateTime = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
    age -= 1;
  return `${age} años`;
};

export const emptyDash = "—";

export const formatDoctorSignatureName = (doctorName: string) => {
  const cleanName = doctorName.trim().replace(/^dra?\.?\s*/i, "");
  return cleanName ? `Dr. ${cleanName}` : "";
};

export const DoctorSignatureBox = ({
  doctorName,
  doctorUser,
}: {
  doctorName: string;
  doctorUser?: { signature?: string; userProfileName?: string; licenseCard?: string };
}) => (
  <div className="hci-print-signature-box">
    <div className="hci-print-signature-img">
      {doctorUser?.signature && <img src={doctorUser.signature} alt="Firma" />}
    </div>
    <div className="hci-print-signature-line">
      {formatDoctorSignatureName(doctorName)}
    </div>
    {doctorUser?.userProfileName && (
      <div className="hci-print-signature-meta">{doctorUser.userProfileName}</div>
    )}
    {doctorUser?.licenseCard && (
      <div className="hci-print-signature-meta">RM: {doctorUser.licenseCard}</div>
    )}
  </div>
);

export interface PrintPatient {
  name: string;
  documentType: string;
  documentNumber: string;
  careScope: string;
  birthDate: string;
  sex: string;
  insurer: string;
  city?: string;
  phone?: string;
}

export const FieldRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <>
    <div className="hci-print-fieldtable-label">- {label}:</div>
    <div className="hci-print-fieldtable-value">
      {value === "" || value === undefined || value === null
        ? emptyDash
        : value}
    </div>
  </>
);

export const INSTITUTION_PROVIDER_ID = 32;

// Datos del paciente para el encabezado a partir de la admisión y del registro
// del paciente (lo que falte en uno se toma del otro).
export const buildPrintPatient = (
  admission?: AdmissionResponse,
  patient?: GetPatient,
): PrintPatient => ({
  name:
    [patient?.firstName, patient?.middleName, patient?.lastName, patient?.secondLastName]
      .filter(Boolean)
      .join(" ") ||
    admission?.nombrePaciente ||
    "",
  documentType: patient?.documentTypeCode || admission?.documentTypeCode || "",
  documentNumber: patient?.documentNumber || admission?.documentoPatiente || "",
  careScope: admission?.careScopeName || "",
  birthDate: patient?.birthDate || "",
  sex: patient?.sexName || "",
  insurer: admission?.epsNombre || patient?.insurerName || "",
  city: patient?.cityName,
  phone: patient?.phone,
});
