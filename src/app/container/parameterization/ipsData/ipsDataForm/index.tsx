"use client";

import Input from "@/components/input";
import Select from "@/components/select";
import FileInput from "@/components/fileInput";
import GridContainer from "@/components/componentLayout";

import { Button, Checkbox, Spin } from "antd";
import { useProviderForm } from "./hooks";

export default function IpsDataForm() {
  const {
    control,
    handleSubmit,
    onSubmit,
    setValue,
    watchedValues,
    cityOptions,
    isLoading,
    isUpdating,
  } = useProviderForm();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="d-flex justify-content-center mb-4">
          <Button type="primary" htmlType="submit" loading={isUpdating}>
            Actualizar datos
          </Button>
        </div>

        <div className="d-flex gap-4" style={{ alignItems: "flex-start" }}>
          <div
            style={{
              minWidth: 200,
              maxWidth: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 180,
                height: 140,
                border: "2px solid #d9d9d9",
                borderRadius: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                background: "#fafafa",
              }}
            >
              {watchedValues.logo ? (
                <img
                  src={
                    typeof watchedValues.logo === "string"
                      ? watchedValues.logo
                      : URL.createObjectURL(watchedValues.logo)
                  }
                  alt="Logo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ color: "#bfbfbf", fontSize: 14 }}>Sin logo</span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Logo</div>
            <FileInput
              name="logo"
              control={control}
              label=""
              accept="image/*"
            />

            {/* Firma rep legal preview */}
            <div
              style={{
                width: 180,
                height: 100,
                border: "2px solid #d9d9d9",
                borderRadius: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                background: "#fafafa",
                marginTop: 8,
              }}
            >
              {watchedValues.legalRepresentativeSign ? (
                <img
                  src={
                    typeof watchedValues.legalRepresentativeSign === "string"
                      ? watchedValues.legalRepresentativeSign
                      : URL.createObjectURL(
                          watchedValues.legalRepresentativeSign,
                        )
                  }
                  alt="Firma Rep Legal"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ color: "#bfbfbf", fontSize: 14 }}>
                  Sin firma
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              Firma rep. legal
            </div>
            <FileInput
              name="legalRepresentativeSign"
              control={control}
              label=""
              accept="image/*"
            />

            {/* Firma emisor factura preview */}
            <div
              style={{
                width: 180,
                height: 100,
                border: "2px solid #d9d9d9",
                borderRadius: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                background: "#fafafa",
                marginTop: 8,
              }}
            >
              {watchedValues.invoiceIssuerSign ? (
                <img
                  src={
                    typeof watchedValues.invoiceIssuerSign === "string"
                      ? watchedValues.invoiceIssuerSign
                      : URL.createObjectURL(watchedValues.invoiceIssuerSign)
                  }
                  alt="Firma Emisor"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ color: "#bfbfbf", fontSize: 14 }}>
                  Sin firma
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              Firma emisor factura
            </div>
            <FileInput
              name="invoiceIssuerSign"
              control={control}
              label=""
              accept="image/*"
            />
          </div>

          {/* Formulario principal */}
          <div style={{ flex: 1 }}>
            <GridContainer columns="col-12 col-md-6" gap="g-3">
              <Input
                name="name"
                label="Nombre"
                placeholder="Nombre"
                control={control}
              />
              <Input
                name="identificationType"
                label="Tipo de identificación"
                placeholder="Tipo de identificación"
                control={control}
              />
              <div className="d-flex gap-2">
                <div style={{ flex: 3 }}>
                  <Input
                    name="nit"
                    label="NIT"
                    placeholder="NIT"
                    control={control}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    name="verificationDigit"
                    label="DV"
                    placeholder="DV"
                    control={control}
                  />
                </div>
              </div>
              <Input
                name="enableCode"
                label="Código de habilitación"
                placeholder="Código de habilitación"
                control={control}
              />
              <Input
                name="phone"
                label="Teléfono"
                placeholder="Teléfono"
                control={control}
              />
              <Input
                name="email"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                control={control}
              />
              <Input
                name="address"
                label="Dirección"
                placeholder="Dirección"
                control={control}
              />
              <Select
                name="cityId"
                label="Ciudad"
                placeholder="Seleccione ciudad"
                control={control}
                options={cityOptions}
              />
              <Input
                name="regimen"
                label="Régimen"
                placeholder="Régimen"
                control={control}
              />
              <Input
                name="invoiceIssuerName"
                label="Nombre emisor de factura"
                placeholder="Nombre emisor de factura"
                control={control}
              />
            </GridContainer>

            {/* Representante legal */}
            <GridContainer columns="col-12 col-md-6" gap="g-3">
              <Input
                name="legalRepresentative"
                label="Representante legal"
                placeholder="Representante legal"
                control={control}
              />
              <div className="d-flex gap-2">
                <div style={{ flex: 1 }}>
                  <Input
                    name="documentType"
                    label="Tipo documento"
                    placeholder="Tipo documento"
                    control={control}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <Input
                    name="documentNumber"
                    label="Número de documento"
                    placeholder="Número de documento"
                    control={control}
                  />
                </div>
              </div>
            </GridContainer>

            {/* Aplica impuesto */}
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <div className="d-flex gap-4 align-items-center">
                <Checkbox
                  checked={watchedValues.applyTax}
                  onChange={(e) => setValue("applyTax", e.target.checked)}
                >
                  Aplica impuesto
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
