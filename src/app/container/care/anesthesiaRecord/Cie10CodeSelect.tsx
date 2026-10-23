"use client"

import { Select } from "antd"
import { useMemo, useRef, useState } from "react"
import { cie10Services, type Cie10Item } from "@/core/hooks/care/cie10/useSearchCie10"
import type { RecordAnestesiaDiagnostico } from "@/core/interfaces/care/recordAnestesia"
import { formatDiagnostico } from "./anesthesiaRecord.utils"

interface Props {
  value?: RecordAnestesiaDiagnostico | null
  onChange?: (value: RecordAnestesiaDiagnostico | null) => void
  placeholder?: string
  disabled?: boolean
}

// El valor es el código y la descripción ya resueltos, así un record cargado
// para editar muestra su diagnóstico sin tener que volver a buscarlo.
export const Cie10CodeSelect = ({ value, onChange, placeholder, disabled }: Props) => {
  const [options, setOptions] = useState<Cie10Item[]>([])
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
        setOptions(await cie10Services.search(query))
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleChange = (codigo?: string) => {
    if (!codigo) {
      onChange?.(null)
      return
    }
    const found = options.find((o) => o.codigo === codigo)
    onChange?.({ codigo, descripcion: found?.descripcion ?? "" })
  }

  const selectOptions = useMemo(() => {
    const list = options.map((o) => ({ value: o.codigo, label: `${o.codigo} - ${o.descripcion}` }))
    if (value && !list.some((o) => o.value === value.codigo)) {
      list.unshift({ value: value.codigo, label: formatDiagnostico(value) })
    }
    return list
  }, [options, value])

  return (
    <Select
      showSearch
      allowClear
      filterOption={false}
      onSearch={handleSearch}
      value={value?.codigo}
      placeholder={placeholder ?? "Buscar por código o descripción"}
      onChange={handleChange}
      loading={loading}
      options={selectOptions}
      style={{ width: "100%" }}
      disabled={disabled}
      notFoundContent={loading ? "Buscando..." : "Escriba al menos 2 caracteres"}
    />
  )
}
