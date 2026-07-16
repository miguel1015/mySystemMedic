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
