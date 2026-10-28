import { useMemo } from "react"
import { useInsurers } from "@/core/hooks/utils/useInsurer"

// Aseguradoras con código, para el campo "Aseguradora" del FURIPS.
export function useInsurerOptions() {
  const { data = [] } = useInsurers()
  return useMemo(
    () =>
      data
        .filter((insurer) => !!insurer.code)
        .map((insurer) => ({
          value: insurer.code,
          label: `${insurer.code} — ${insurer.name}`,
          name: insurer.name,
        })),
    [data],
  )
}
