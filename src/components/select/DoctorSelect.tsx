"use client";

import { Select } from "antd";
import type { DoctorOption } from "@/core/hooks/users/useCurrentDoctor";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

interface DoctorSelectProps {
  value?: number;
  options: DoctorOption[];
  onChange: (value: number) => void;
  placeholder?: string;
}

/**
 * Select de médico tratante: muestra el perfil del usuario (Médico,
 * Enfermero, Ortopedista...) junto al nombre y permite buscar por ambos.
 */
export function DoctorSelect({
  value,
  options,
  onChange,
  placeholder = "Buscar médico",
}: DoctorSelectProps) {
  return (
    <Select<number, DoctorOption>
      showSearch
      filterOption={(input, option) =>
        normalize(`${option?.label ?? ""} ${option?.profile ?? ""}`).includes(
          normalize(input),
        )
      }
      placeholder={placeholder}
      value={value}
      options={options}
      onChange={onChange}
      optionRender={(option) => (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
          <span>{option.data.label}</span>
          {option.data.profile && (
            <span style={{ fontSize: 12, opacity: 0.65 }}>{option.data.profile}</span>
          )}
        </div>
      )}
      labelRender={({ value: selected, label }) => {
        const profile = options.find((o) => o.value === selected)?.profile;
        return profile ? `${label} · ${profile}` : label;
      }}
      style={{ width: "100%", marginTop: 2 }}
      popupMatchSelectWidth={false}
      size="small"
    />
  );
}
