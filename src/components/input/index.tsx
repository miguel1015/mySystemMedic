"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import classNames from "classnames";

export type InputSize = "sm" | "lg";

export interface InputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
  bsSize?: InputSize;
  className?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function Input<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  bsSize,
  className,
  type = "text",
  placeholder,
  disabled,
}: InputProps<T>) {
  // Controlador interno
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="mb-3">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="form-label fw-semibold">
          {label}
        </label>
      )}

      {/* Input */}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...field}
        onChange={(e) => {
          const val = e.target.value;
          if (type === "number") {
            field.onChange(val === "" ? undefined : Number(val));
          } else {
            field.onChange(val);
          }
        }}
        className={classNames(
          "form-control",
          {
            "form-control-sm": bsSize === "sm",
            "form-control-lg": bsSize === "lg",
            "is-invalid": !!error,
          },
          className
        )}
      />

      {/* Error */}
      {error && <div className="invalid-feedback d-block">{error.message}</div>}

      {/* Helper text */}
      {!error && helperText && <div className="form-text">{helperText}</div>}
    </div>
  );
}
