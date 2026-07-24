import { surgicalProcedureServices } from "@/core/hooks/care/surgicalProcedures/useSearchSurgicalProcedures"
import { cie10Services } from "@/core/hooks/care/cie10/useSearchCie10"

export const resolveProcedureDescription = async (code: string): Promise<string> => {
  if (!code) return ""
  try {
    const results = await surgicalProcedureServices.search(code)
    const match = results.find((r) => r.code.toLowerCase() === code.toLowerCase())
    return match?.codeDescription || match?.cupsDescription || ""
  } catch {
    return ""
  }
}

export const resolveDiagnosisDescription = async (code: string): Promise<string> => {
  if (!code) return ""
  try {
    const results = await cie10Services.search(code)
    const match = results.find((r) => r.codigo.toLowerCase() === code.toLowerCase())
    return match?.descripcion || ""
  } catch {
    return ""
  }
}
