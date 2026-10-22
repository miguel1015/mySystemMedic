"use client"

import { useCupsSearch, useCupsSuggestions } from "@/core/hooks/parameterization/cups/useCups"
import type {
  CupsRipsType,
  CupsSuggestion,
  CupsSuggestionSource,
} from "@/core/interfaces/parameterization/cups"
import { BookOutlined, BulbOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Select, Space, Tag, Tooltip } from "antd"
import { useEffect, useMemo, useState } from "react"

const TYPE_LABELS: Record<CupsRipsType, string> = {
  AC: "Consulta",
  AP: "Procedimiento",
  AT: "Estancia",
}

const SOURCE_LABELS: Record<CupsSuggestionSource, string> = {
  T: "Manual tarifario · hoja de tarifas 2026",
  H2: "Manual tarifario · Homologador 2",
  H1: "Manual tarifario · Homologador 1",
  SOD: "Reemplazo vigente del CUPS SOD que trae el manual",
}

export interface CupsOption {
  code: string
  name: string
}

interface CupsPickerProps {
  // Descripción del manual tarifario: se usa para sugerir CUPS si no llegan `suggestions`.
  description: string
  type?: CupsRipsType
  // Código del manual tarifario: si el manual lo homologa, se sugieren esos CUPS.
  referenceCode?: number
  value: CupsOption | null
  onChange: (value: CupsOption | null) => void
  // Sugerencias ya calculadas (la pantalla de homologación las trae con cada fila).
  suggestions?: CupsSuggestion[]
  disabled?: boolean
  // Si se pasa, se ofrece agregar un CUPS que no está en el catálogo.
  onRequestNew?: () => void
  // Busca también los CUPS deshabilitados en SISPRO (se marcan en la lista).
  includeDisabled?: boolean
}

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function SuggestionTag({ suggestion, selected, onPick }: {
  suggestion: CupsSuggestion
  selected: boolean
  onPick: () => void
}) {
  return (
    <Tooltip
      title={
        suggestion.source
          ? `${suggestion.name} · ${SOURCE_LABELS[suggestion.source]}`
          : `${suggestion.name} · coincidencia ${Math.round(suggestion.score * 100)} %`
      }
    >
      <Tag
        color={selected ? "processing" : "default"}
        style={{ cursor: "pointer", marginInlineEnd: 0, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}
        onClick={onPick}
      >
        <strong style={{ fontFamily: "monospace" }}>{suggestion.code}</strong> {suggestion.name}
      </Tag>
    </Tooltip>
  )
}

// Selector de CUPS: sugerencias del manual tarifario o, si no homologa el código, por similitud
// de la descripción (siempre las confirma una persona), y búsqueda en la tabla oficial.
export default function CupsPicker({
  description,
  type,
  referenceCode,
  value,
  onChange,
  suggestions: givenSuggestions,
  disabled,
  onRequestNew,
  includeDisabled,
}: CupsPickerProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounced(search)

  const { data: fetchedSuggestions = [], isFetching: loadingSuggestions } = useCupsSuggestions(
    givenSuggestions ? null : description,
    type,
    referenceCode,
  )
  const suggestions = givenSuggestions ?? fetchedSuggestions
  // Las del manual se muestran todas; las de similitud, solo las 3 mejores.
  const fromManual = suggestions.some((s) => s.source)
  const { data: results = [], isFetching: searching } = useCupsSearch(
    debouncedSearch,
    undefined,
    includeDisabled,
  )

  const options = useMemo(() => {
    const base = debouncedSearch.trim().length >= 2
      ? results.map((r) => ({
          code: r.code,
          name: r.name,
          // Un CUPS manual puede tener un tipo distinto de AC/AP/AT: se muestra tal cual.
          hint: [
            r.ripsType ? TYPE_LABELS[r.ripsType] ?? r.ripsType : "",
            r.isManual ? "Manual" : "",
            r.isEnabled ? "" : "Deshabilitado",
          ]
            .filter(Boolean)
            .join(" · "),
        }))
      : suggestions.map((s) => ({
          code: s.code,
          name: s.name,
          hint: s.source ? "Manual tarifario" : `Sugerido · ${Math.round(s.score * 100)} %`,
        }))

    // El valor actual siempre debe estar entre las opciones para mostrarse.
    if (value && !base.some((o) => o.code === value.code)) {
      base.unshift({ code: value.code, name: value.name, hint: "" })
    }

    return base.map((o) => ({
      value: o.code,
      title: o.name,
      label: (
        <Space size={6} style={{ maxWidth: "100%" }}>
          <strong style={{ fontFamily: "monospace" }}>{o.code}</strong>
          <span style={{ whiteSpace: "normal" }}>{o.name}</span>
          {o.hint && <Tag style={{ marginInlineEnd: 0 }}>{o.hint}</Tag>}
        </Space>
      ),
    }))
  }, [debouncedSearch, results, suggestions, value])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <Select
        showSearch
        allowClear
        disabled={disabled}
        value={value?.code ?? null}
        placeholder="Buscar CUPS por código o nombre"
        filterOption={false}
        onSearch={setSearch}
        loading={searching || loadingSuggestions}
        options={options}
        optionLabelProp="value"
        notFoundContent={
          debouncedSearch.trim().length >= 2 ? "Sin resultados" : "Escriba al menos 2 caracteres"
        }
        onChange={(code) => {
          if (!code) {
            onChange(null)
            return
          }
          const option = options.find((o) => o.value === code)
          onChange({ code, name: option?.title ?? "" })
          setSearch("")
        }}
        style={{ width: "100%" }}
        popupMatchSelectWidth={520}
        // El modal del proyecto usa z-index 1055 y el desplegable de antd 1050: sin esto la
        // lista queda detrás. Se monta en el body para que el modal no la recorte.
        getPopupContainer={() => document.body}
        styles={{ popup: { root: { zIndex: 1060 } } }}
      />

      {value && (
        <span style={{ fontSize: 12, color: "var(--dash-text-secondary, #6b7280)" }}>{value.name}</span>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {fromManual ? (
            <Tooltip title="CUPS que homologa el manual tarifario para este código">
              <BookOutlined style={{ color: "#16a34a" }} />
            </Tooltip>
          ) : (
            <BulbOutlined style={{ color: "#d97706" }} />
          )}
          {(fromManual ? suggestions : suggestions.slice(0, 3)).map((s) => (
            <SuggestionTag
              key={s.code}
              suggestion={s}
              selected={value?.code === s.code}
              onPick={() => !disabled && onChange({ code: s.code, name: s.name })}
            />
          ))}
        </div>
      )}

      {onRequestNew && (
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          disabled={disabled}
          onClick={onRequestNew}
          style={{ alignSelf: "flex-start", paddingInline: 0 }}
        >
          Agregar un CUPS que no está en el catálogo
        </Button>
      )}
    </div>
  )
}
