export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0)
}

export function calculateAge(
  birthDate: string | null | undefined,
  referenceDate: string | null | undefined,
): number | null {
  if (!birthDate) return null

  const birth = new Date(birthDate)
  const reference = referenceDate ? new Date(referenceDate) : new Date()
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return null

  let age = reference.getFullYear() - birth.getFullYear()
  const monthDiff = reference.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--
  }

  return age >= 0 ? age : null
}

const UNITS = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
const TEENS = [
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISEIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
]
const TENS = [
  "",
  "DIEZ",
  "VEINTE",
  "TREINTA",
  "CUARENTA",
  "CINCUENTA",
  "SESENTA",
  "SETENTA",
  "OCHENTA",
  "NOVENTA",
]
const HUNDREDS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
]

function apocopeUno(words: string): string {
  return words.replace(/UNO$/, "UN")
}

function groupToWords(n: number): string {
  if (n === 0) return ""
  if (n === 100) return "CIEN"

  const hundredDigit = Math.floor(n / 100)
  const rest = n % 100

  let words = hundredDigit > 0 ? HUNDREDS[hundredDigit] : ""

  if (rest > 0) {
    let restWords: string
    if (rest < 10) {
      restWords = UNITS[rest]
    } else if (rest < 20) {
      restWords = TEENS[rest - 10]
    } else if (rest < 30) {
      restWords = rest === 20 ? "VEINTE" : "VEINTI" + UNITS[rest - 20]
    } else {
      const tensDigit = Math.floor(rest / 10)
      const unitDigit = rest % 10
      restWords = TENS[tensDigit] + (unitDigit > 0 ? " Y " + UNITS[unitDigit] : "")
    }
    words = words ? `${words} ${restWords}` : restWords
  }

  return words
}

export function numberToWordsEs(value: number): string {
  const n = Math.floor(Math.abs(value ?? 0))
  if (n === 0) return "CERO"

  const units = n % 1000
  const thousands = Math.floor(n / 1000) % 1000
  const millions = Math.floor(n / 1_000_000) % 1000
  const thousandMillions = Math.floor(n / 1_000_000_000) % 1000

  const parts: string[] = []

  if (thousandMillions > 0) {
    parts.push(
      thousandMillions === 1
        ? "MIL MILLONES"
        : `${apocopeUno(groupToWords(thousandMillions))} MIL MILLONES`,
    )
  }

  if (millions > 0) {
    parts.push(millions === 1 ? "UN MILLON" : `${apocopeUno(groupToWords(millions))} MILLONES`)
  }

  if (thousands > 0) {
    parts.push(thousands === 1 ? "MIL" : `${apocopeUno(groupToWords(thousands))} MIL`)
  }

  if (units > 0) {
    parts.push(apocopeUno(groupToWords(units)))
  }

  return parts.join(" ")
}

export function currencyToWordsEs(value: number | null | undefined): string {
  const safeValue = Math.max(0, Math.round(value ?? 0))
  return `${numberToWordsEs(safeValue)} PESOS M/CTE`
}
