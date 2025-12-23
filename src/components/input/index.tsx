"use client";

import React from "react";
import { Input } from "antd";
import type { InputProps as AntdInputProps } from "antd";
import { useController, Control, FieldValues, Path } from "react-hook-form";

export interface RHFAntdInputProps<T extends FieldValues>
  extends AntdInputProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
}

export default function RHFAntdInput<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  type = "text",
  disabled,
  ...antdProps
}: RHFAntdInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Label */}
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

      {/* Ant Design Input */}
      <Input
        {...antdProps}
        {...field}
        type={type}
        disabled={disabled}
        status={error ? "error" : undefined}
        value={field.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;

          if (type === "number") {
            field.onChange(value === "" ? undefined : Number(value));
          } else {
            field.onChange(value);
          }
        }}
      />

      {/* Error */}
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, marginTop: 4 }}>
          {helperText}
        </div>
      )}
    </div>
  );
}
