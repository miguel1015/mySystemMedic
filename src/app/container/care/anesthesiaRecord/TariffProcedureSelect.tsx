"use client"

import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { TTariffDetailsPaged } from "@/core/interfaces/parameterization/types"
import { Select } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"

interface Props {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const PAGE_SIZE = 30

// El procedimiento se guarda como texto "código - nombre" en el mismo campo del
// record, así los records anteriores (texto libre) se siguen mostrando igual.
export const TariffProcedureSelect = ({ value, onChange, placeholder, disabled }: Props) => {
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const requestRef = useRef(0)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleSearch = (text: string) => {
    clearTimeout(debounceRef.current)
    const query = text.trim()
    if (query.length < 2) {
      setOptions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current
      setLoading(true)
      try {
        const res = await getAll<TTariffDetailsPaged>(
          ENDPOINTS.TARIFF_DETAILS.GET_ALL_PAGED(1, PAGE_SIZE, query),
        )
        if (requestId !== requestRef.current) return
        // El mismo procedimiento existe en varios manuales tarifarios: solo
        // interesan código y nombre, así que se quitan los repetidos.
        const labels = (res?.items ?? []).map(
          (t) => `${t.referenceCode} - ${t.description.trim()}`,
        )
        setOptions(Array.from(new Set(labels)))
      } catch {
        if (requestId === requestRef.current) setOptions([])
      } finally {
        if (requestId === requestRef.current) setLoading(false)
      }
    }, 300)
  }

  const selectOptions = useMemo(() => {
    const list = options.map((label) => ({ value: label, label }))
    if (value && !options.includes(value)) list.unshift({ value, label: value })
    return list
  }, [options, value])

  return (
    <Select
      showSearch
      allowClear
      filterOption={false}
      onSearch={handleSearch}
      value={value || undefined}
      onChange={(next?: string) => onChange?.(next ?? "")}
      loading={loading}
      options={selectOptions}
      placeholder={placeholder ?? "Buscar por código o nombre del procedimiento"}
      style={{ width: "100%" }}
      disabled={disabled}
      notFoundContent={loading ? "Buscando..." : "Escriba al menos 2 caracteres"}
    />
  )
}
