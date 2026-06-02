import { useElementTypes } from "@/core/hooks/utils/useElementTypes"
import { useElementUsages } from "@/core/hooks/utils/useElementUsages"

function getLabel(item: { id: number; description?: string; name?: string }) {
  return item.description ?? item.name ?? String(item.id)
}

export function useSelectOptions() {
  const { data: elementTypes, isLoading: loadingElementTypes } =
    useElementTypes()
  const { data: elementUsages, isLoading: loadingElementUsages } =
    useElementUsages()

  const elementTypeOptions = (elementTypes ?? []).map((item) => ({
    value: item.id,
    label: getLabel(item),
  }))

  const elementUsageOptions = (elementUsages ?? []).map((item) => ({
    value: item.id,
    label: getLabel(item),
  }))

  return {
    elementTypeOptions,
    elementUsageOptions,
    isLoading: loadingElementTypes || loadingElementUsages,
  }
}
