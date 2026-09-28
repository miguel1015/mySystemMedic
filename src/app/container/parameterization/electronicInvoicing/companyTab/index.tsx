"use client"

import Input from "@/components/input"
import Select from "@/components/select"
import FileInput from "@/components/fileInput"
import GridContainer from "@/components/componentLayout"
import {
  TElectronicInvoiceCatalogItem,
  TElectronicInvoiceCompany,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { Alert, Button, Input as AntdInput } from "antd"
import {
  COMPANY_TYPE_OPTIONS,
  FISCAL_RESPONSIBILITY_OPTIONS,
  IDENTIFICATION_TYPE_OPTIONS,
  REGIME_TYPE_OPTIONS,
  withCurrentOption,
} from "../catalogs"
import { useCompanyForm } from "./useCompanyForm"

interface CompanyTabProps {
  company: TElectronicInvoiceCompany
  states: TElectronicInvoiceCatalogItem[]
}

export default function CompanyTab({ company, states }: CompanyTabProps) {
  const {
    control,
    watched,
    submitForm,
    stateOptions,
    cityOptions,
    isLoadingCities,
    onStateChange,
    removeLogo,
    isSaving,
  } = useCompanyForm(company, states)

  const logoSrc =
    watched.logo instanceof File
      ? URL.createObjectURL(watched.logo)
      : typeof watched.logo === "string"
        ? watched.logo
        : null

  return (
    <form onSubmit={submitForm}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Estos datos identifican a la IPS como emisor en la factura electrónica y en su representación gráfica (PDF). Se guardan en el servicio de Facturación Electrónica, independientes de «Datos IPS»."
      />

      <div className="d-flex gap-4" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 200,
              height: 140,
              border: "2px solid #d9d9d9",
              borderRadius: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              background: "var(--dash-surface-hover, #f3f4f6)",
            }}
          >
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ color: "var(--dash-text-tertiary, #9ca3af)", fontSize: 14 }}>Sin logo</span>
            )}
          </div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Logo de la factura</div>
          <FileInput name="logo" control={control} label="" accept="image/*" maxFileSize={1024 * 1024} />
          {logoSrc && (
            <Button size="small" danger onClick={removeLogo}>
              Quitar logo
            </Button>
          )}

          <div style={{ width: "100%", marginTop: 8 }}>
            <Input
              name="primaryInvoiceColor"
              label="Color principal del PDF"
              placeholder="#3a77c7"
              control={control}
              addonAfter={
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: /^#[0-9a-fA-F]{6}$/.test(watched.primaryInvoiceColor ?? "")
                      ? watched.primaryInvoiceColor
                      : "transparent",
                    border: "1px solid #d9d9d9",
                  }}
                />
              }
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <GridContainer columns="col-12 col-md-6" gap="g-3">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>NIT</label>
              <AntdInput value={company.companyNum} disabled />
              <div style={{ color: "var(--dash-text-tertiary, #9ca3af)", fontSize: 12, marginTop: 4 }}>
                El NIT identifica a la empresa y a su certificado; no se puede cambiar aquí.
              </div>
            </div>
            <Input name="name" label="Razón social" placeholder="Razón social" control={control} />
            <Select
              name="identificationType"
              label="Tipo de identificación (DIAN)"
              placeholder="Seleccione"
              control={control}
              options={withCurrentOption(IDENTIFICATION_TYPE_OPTIONS, company.identificationType)}
              helperText="Debe existir en el catálogo de tipos de documento de Facturación Electrónica."
            />
            <Select
              name="companyType"
              label="Tipo de persona"
              placeholder="Seleccione"
              control={control}
              options={withCurrentOption(COMPANY_TYPE_OPTIONS, company.companyType)}
            />
            <Select
              name="regimeType"
              label="Régimen fiscal"
              placeholder="Seleccione"
              control={control}
              options={withCurrentOption(REGIME_TYPE_OPTIONS, company.regimeType)}
            />
            <Select
              name="fiscalResponsibility"
              label="Responsabilidades fiscales"
              placeholder="Seleccione"
              control={control}
              isMulti
              options={FISCAL_RESPONSIBILITY_OPTIONS.concat(
                (watched.fiscalResponsibility ?? [])
                  .filter((v): v is string => !!v && !FISCAL_RESPONSIBILITY_OPTIONS.some((o) => o.value === v))
                  .map((v) => ({ value: v, label: `${v} (valor actual)` })),
              )}
            />
            <Input name="operationType" label="Tipo de operación" placeholder="Ej: 10" control={control} />
            <Input name="email" label="Correo electrónico" placeholder="correo@ejemplo.com" control={control} />
            <Input name="phoneNum" label="Teléfono" placeholder="Teléfono" control={control} />
            <Input name="address" label="Dirección" placeholder="Dirección" control={control} />
            <Select
              name="stateCode"
              label="Departamento"
              placeholder="Seleccione"
              control={control}
              options={stateOptions}
              onChange={onStateChange}
            />
            <Select
              name="cityCode"
              label="Ciudad"
              placeholder={isLoadingCities ? "Cargando..." : "Seleccione"}
              control={control}
              options={cityOptions}
              loading={isLoadingCities}
            />
            <Input name="postalZone" label="Código postal" placeholder="Ej: 080001" control={control} />
          </GridContainer>

          <div className="d-flex justify-content-end mt-2">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Guardar emisor
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
