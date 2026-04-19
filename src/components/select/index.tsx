"use client";

import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useController, Control, FieldValues, Path } from "react-hook-form";

export interface SelectOption {
  label: string;
  value: number | string;
}

export interface RHFAntdSelectProps<T extends FieldValues>
  extends Omit<SelectProps, "options" | "value" | "onChange" | "mode"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
  options: SelectOption[];
  isMulti?: boolean;
}

export default function RHFAntdSelect<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  options,
  isMulti = false,
  disabled,
  placeholder,
  ...antdProps
}: RHFAntdSelectProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}

      <Select
        getPopupContainer={(trigger) => trigger.parentElement!}
        dropdownStyle={{ zIndex: 1060 }}
        {...antdProps}
        disabled={disabled}
        placeholder={placeholder}
        options={options}
        mode={isMulti ? "multiple" : undefined}
        status={error ? "error" : undefined}
        value={field.value || undefined}
        onChange={(val) => field.onChange(val)}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: "100%" }}
      />

      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}

      {!error && helperText && (
        <div style={{ color: "var(--dash-text-tertiary, #9ca3af)", fontSize: 12, marginTop: 4 }}>
          {helperText}
        </div>
      )}
    </div>
  );
}
