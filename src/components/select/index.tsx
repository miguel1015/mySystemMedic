"use client";

import React from "react";
import { useController, Control } from "react-hook-form";
import Select, { SingleValue, MultiValue, StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { useTheme } from "./theme";

export type InputSize = "sm" | "lg";

export interface SelectOption {
  label: string;
  value: number;
}

export interface SelectAutocompleteProps {
  name: string;
  control: Control<any>;
  label?: string;
  helperText?: string;
  bsSize?: InputSize;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  options: SelectOption[];
  isMulti?: boolean;
  themeMode?: "dark" | "light"; // modo claro u oscuro
}

export default function SelectAutocomplete({
  name,
  control,
  label,
  helperText,
  bsSize,
  className,
  disabled,
  placeholder,
  options,
  isMulti = false,
}: SelectAutocompleteProps) {
  const themeMode = useTheme();

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<any>({
    name,
    control,
  });

  const handleChange = (
    newValue: SingleValue<SelectOption> | MultiValue<SelectOption>
  ) => {
    if (isMulti) {
      (newValue as SelectOption[]).map((v) => v.value);
    } else {
      onChange((newValue as SelectOption)?.value ?? null);
    }
  };

  const colors = {
    dark: {
      controlBg: "#1f2937",
      controlBorder: "#374151",
      controlBorderFocus: "#4f46e5",
      text: "#fff",
      placeholder: "#9ca3af",
      optionHover: "rgba(79, 70, 229, 0.2)",
      optionSelected: "#4f46e5",
      menuBg: "#111827",
      multiValueBg: "#4f46e5",
      multiValueText: "#fff",
      multiValueRemoveHover: "#f87171",
      errorBorder: "#ef4444",
      scrollBg: "#374151",
      scrollThumb: "#4f46e5",
    },
    light: {
      controlBg: "#fff",
      controlBorder: "#d1d5db",
      controlBorderFocus: "#4f46e5",
      text: "#111827",
      placeholder: "#6b7280",
      optionHover: "rgba(79, 70, 229, 0.1)",
      optionSelected: "#4f46e5",
      menuBg: "#f9fafb",
      multiValueBg: "#4f46e5",
      multiValueText: "#fff",
      multiValueRemoveHover: "#f87171",
      errorBorder: "#ef4444",
      scrollBg: "#e5e7eb",
      scrollThumb: "#4f46e5",
    },
  };

  const themeColors = themeMode === "dark" ? colors.dark : colors.light;

  const customStyles: StylesConfig<SelectOption, boolean> = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "8px",
      borderColor: error
        ? themeColors.errorBorder
        : state.isFocused
        ? themeColors.controlBorderFocus
        : themeColors.controlBorder,
      boxShadow: state.isFocused ? `0 0 0 2px rgba(79, 70, 229, 0.3)` : "none",
      backgroundColor: themeColors.controlBg,
      color: themeColors.text,
      minHeight: bsSize === "sm" ? 34 : bsSize === "lg" ? 50 : 40,
      transition: "all 0.3s ease",
      opacity: disabled ? 0.55 : 1,
      cursor: disabled ? "not-allowed" : "default",
    }),
    input: (provided) => ({
      ...provided,
      color: themeColors.text,
      opacity: disabled ? 0.6 : 1,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: themeColors.text,
      opacity: disabled ? 0.6 : 1,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: themeColors.multiValueBg,
      color: themeColors.multiValueText,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: themeColors.multiValueText,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: themeColors.multiValueText,
      ":hover": {
        backgroundColor: themeColors.multiValueRemoveHover,
        color: "#fff",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: themeColors.menuBg,
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? themeColors.optionHover
        : state.isSelected
        ? themeColors.optionSelected
        : "transparent",
      color: state.isSelected ? "#fff" : themeColors.text,
      cursor: disabled ? "not-allowed" : "pointer",
      pointerEvents: disabled ? "none" : "auto",
      transition: "all 0.2s",
      ":active": {
        backgroundColor: themeColors.optionSelected,
        color: "#fff",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: themeColors.placeholder,
      opacity: disabled ? 0.6 : 1,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 250,
      paddingRight: 4,
      scrollbarWidth: "thin",
      scrollbarColor: `${themeColors.scrollThumb} ${themeColors.scrollBg}`,
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: themeColors.scrollBg,
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: themeColors.scrollThumb,
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: themeColors.optionSelected,
      },
    }),
  };

  return (
    <div className={`mb-3 ${className ?? ""}`}>
      {label && <label className="form-label fw-semibold">{label}</label>}

      <Select<SelectOption, typeof isMulti>
        value={
          isMulti
            ? options.filter((opt) => (value || []).includes(opt.value))
            : options.find((opt) => opt.value === value) || null
        }
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isMulti={isMulti}
        closeMenuOnSelect={!isMulti}
        isClearable={true}
        components={makeAnimated()}
        classNamePrefix="react-select"
        menuPlacement="auto"
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        filterOption={(option, input) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        styles={customStyles}
      />

      {error && <div className="invalid-feedback d-block">{error.message}</div>}
      {!error && helperText && <div className="form-text">{helperText}</div>}
    </div>
  );
}
