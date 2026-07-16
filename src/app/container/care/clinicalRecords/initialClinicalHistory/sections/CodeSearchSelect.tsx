"use client"

import { Select, Typography } from "antd"
import { useMemo, useRef, useState } from "react"

export interface CodeSearchOption {
  code: string
  description: string
}

interface Props {
  value: string
  description: string
  onValueChange: (code: string, description: string) => void
  fetchOptions: (search: string) => Promise<CodeSearchOption[]>
  placeholder: string
  disabled?: boolean
  maxLength?: number
}

export const CodeSearchSelect = ({
  value,
  description,
  onValueChange,
  fetchOptions,
  placeholder,
  disabled,
  maxLength,
}: Props) => {
  const [options, setOptions] = useState<CodeSearchOption[]>([])
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
        const results = await fetchOptions(query)
        setOptions(maxLength ? results.filter((r) => r.code.length <= maxLength) : results)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleChange = (code: string | undefined) => {
    if (!code) {
      onValueChange("", "")
      return
    }
    const found = options.find((o) => o.code === code)
    onValueChange(code, found?.description ?? "")
  }

  const selectOptions = useMemo(
    () => options.map((o) => ({ value: o.code, label: `${o.code} - ${o.description}` })),
    [options],
  )

  return (
    <div style={{ flex: "1 1 260px", minWidth: 0 }}>
      <Select
        showSearch
        allowClear
        value={value || undefined}
        placeholder={placeholder}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        loading={loading}
        options={selectOptions}
        style={{ width: "100%" }}
        disabled={disabled}
        notFoundContent={loading ? "Buscando..." : "Escriba al menos 2 caracteres"}
      />
      {description && (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
          {description}
        </Typography.Text>
      )}
    </div>
  )
}
