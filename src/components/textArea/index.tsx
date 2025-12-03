"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import classNames from "classnames";

export interface TextAreaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export default function TextArea<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  className,
  placeholder,
  disabled,
  rows = 3,
}: TextAreaProps<T>) {
  // Internal controller
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

      {/* Textarea */}
      <textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...field}
        className={classNames(
          "form-control",
          {
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
