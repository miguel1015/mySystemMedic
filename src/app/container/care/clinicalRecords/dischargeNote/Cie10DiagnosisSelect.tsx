"use client"

import { Select } from "antd"
import { useMemo, useRef, useState } from "react"
import { cie10Services } from "@/core/hooks/care/cie10/useSearchCie10"

interface Props {
  value?: number
  onSelect: (cie10Id: number | undefined, codigo: string, descripcion: string) => void
  placeholder: string
  disabled?: boolean
  allowClear?: boolean
  style?: React.CSSProperties
}

export const Cie10DiagnosisSelect = ({
  value,
  onSelect,
  placeholder,
  disabled,
  allowClear,
  style,
}: Props) => {
  const [options, setOptions] = useState<{ id: number; codigo: string; descripcion: string }[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const query = text.trim()
    if (query.length < 2) {
      setOptions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await cie10Services.search(query)
        setOptions(results)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleChange = (id: number | undefined) => {
    if (!id) {
      onSelect(undefined, "", "")
      return
    }
    const found = options.find((o) => o.id === id)
    onSelect(id, found?.codigo ?? "", found?.descripcion ?? "")
  }

  const selectOptions = useMemo(
    () => options.map((o) => ({ value: o.id, label: `${o.codigo} - ${o.descripcion}` })),
    [options],
  )

  return (
    <Select
      showSearch
      allowClear={allowClear}
      value={value}
      placeholder={placeholder}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      loading={loading}
      options={selectOptions}
      style={{ width: "100%", ...style }}
      disabled={disabled}
      notFoundContent={loading ? "Buscando..." : "Escriba al menos 2 caracteres"}
    />
  )
}
