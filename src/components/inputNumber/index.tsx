"use client";

import React from "react";
import { InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import { useController, Control, FieldValues, Path } from "react-hook-form";

export interface RHFAntdInputNumberProps<T extends FieldValues>
  extends Omit<InputNumberProps, "value" | "onChange"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
}

export default function RHFAntdInputNumber<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  style,
  ...antdProps
}: RHFAntdInputNumberProps<T>) {
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

      <InputNumber
        {...antdProps}
        disabled={disabled}
        status={error ? "error" : undefined}
        style={{ width: "100%", ...style }}
        value={field.value ?? null}
        onChange={(value) => field.onChange(value ?? undefined)}
        onBlur={field.onBlur}
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
