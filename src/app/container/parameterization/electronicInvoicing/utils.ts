import dayjs from "dayjs"

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Las fechas de resolución y certificado llegan en UTC ("2030-01-19T00:00:00Z"); se toma la
// fecha calendario tal cual, sin pasarla a hora local (en Colombia retrocedería un día).
export function toDateInput(value?: string | null) {
  return value ? value.substring(0, 10) : ""
}

export function formatDate(value?: string | null) {
  return toDateInput(value) || "-"
}

export function daysUntil(value: string) {
  return dayjs(toDateInput(value)).diff(dayjs().startOf("day"), "day")
}
