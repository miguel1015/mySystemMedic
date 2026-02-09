"use client"

import Input from "@/components/input"
import Select from "@/components/select"
import FileInput from "@/components/fileInput"
import GridContainer from "@/components/componentLayout"
import Modal from "@/components/modal"
import { useStates } from "@/core/hooks/utils/useStates"
import { useCities } from "@/core/hooks/utils/useCities"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Checkbox } from "antd"
import { Dispatch, SetStateAction } from "react"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface IpsDataFormProps {
  openResolution: boolean;
  setOpenResolution: Dispatch<SetStateAction<boolean>>;
}

const ipsDataSchema = z.object({
  companyName: z.string().min(1, "Nombre de la empresa es obligatorio"),
  nit: z.string().min(1, "NIT es obligatorio"),
  verificationDigit: z
    .number({
      required_error: "Dígito de verificación es obligatorio",
      invalid_type_error: "Dígito de verificación es obligatorio",
    })
    .min(0),
  habilitationCode: z.string().min(1, "Código de habilitación es obligatorio"),
  complexityLevel: z
    .number({
      required_error: "Complejidad es obligatoria",
      invalid_type_error: "Complejidad es obligatoria",
    })
    .positive("Complejidad es obligatoria"),
  invoiceConsecutive: z
    .number({
      required_error: "Consecutivo es obligatorio",
      invalid_type_error: "Consecutivo es obligatorio",
    })
    .min(0),
  phone: z.string().min(1, "Teléfono es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  ivaPercentage: z
    .number({
      required_error: "IVA es obligatorio",
      invalid_type_error: "IVA es obligatorio",
    })
    .min(0),
  currencySymbol: z
    .number({
      required_error: "Símbolo de moneda es obligatorio",
      invalid_type_error: "Símbolo de moneda es obligatorio",
    })
    .positive("Símbolo de moneda es obligatorio"),
  address: z.string().min(1, "Dirección es obligatoria"),
  stateId: z
    .number({
      required_error: "Departamento es obligatorio",
      invalid_type_error: "Departamento es obligatorio",
    })
    .positive("Departamento es obligatorio"),
  cityId: z
    .number({
      required_error: "Ciudad es obligatoria",
      invalid_type_error: "Ciudad es obligatoria",
    })
    .positive("Ciudad es obligatoria"),
  isIps: z.boolean().optional(),
  isAmbulance: z.boolean().optional(),
  electronicInvoicing: z
    .number({
      required_error: "Seleccione una opción",
      invalid_type_error: "Seleccione una opción",
    })
    .optional(),
  ownWebServices: z
    .number({
      required_error: "Seleccione una opción",
      invalid_type_error: "Seleccione una opción",
    })
    .optional(),
  apiSiigo: z
    .number({
      required_error: "Seleccione una opción",
      invalid_type_error: "Seleccione una opción",
    })
    .optional(),
  legalRepDocument: z
    .string()
    .min(1, "Documento del representante legal es obligatorio"),
  legalRepName: z
    .string()
    .min(1, "Nombre del representante legal es obligatorio"),
  logo: z.any().optional(),
  legalRepSignature: z.any().optional(),
})

type TIpsDataForm = z.infer<typeof ipsDataSchema>

const resolutionSchema = z.object({
  resolution: z.string().min(1, "Resolución es obligatoria"),
  prefix: z.string().min(1, "Prefijo es obligatorio"),
  initialRange: z
    .number({
      required_error: "Rango inicial es obligatorio",
      invalid_type_error: "Rango inicial es obligatorio",
    })
    .positive("Rango inicial es obligatorio"),
  finalRange: z
    .number({
      required_error: "Rango final es obligatorio",
      invalid_type_error: "Rango final es obligatorio",
    })
    .positive("Rango final es obligatorio"),
  startDate: z.string().min(1, "Fecha inicio es obligatoria"),
  endDate: z.string().min(1, "Fecha fin es obligatoria"),
  pin: z.string().min(1, "Pin es obligatorio"),
  typeId: z
    .number({
      required_error: "Tipo es obligatorio",
      invalid_type_error: "Tipo es obligatorio",
    })
    .positive("Tipo es obligatorio"),
})

type TResolutionForm = z.infer<typeof resolutionSchema>

const complexityOptions = [
  { value: 1, label: "Baja" },
  { value: 2, label: "Media" },
  { value: 3, label: "Alta" },
]

const currencyOptions = [
  { value: 1, label: "$" },
  { value: 2, label: "€" },
  { value: 3, label: "£" },
]

const booleanOptions = [
  { value: 1, label: "Sí" },
  { value: 2, label: "No" },
]

const resolutionTypeOptions = [
  { value: 1, label: "Facturación" },
  { value: 2, label: "Nota crédito" },
  { value: 3, label: "Nota débito" },
]

export default function IpsDataForm({
  openResolution,
  setOpenResolution,
}: IpsDataFormProps) {
  const { data: statesData } = useStates()
  const { data: citiesData } = useCities()

  const stateOptions = (statesData ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }))

  const cityOptions = (citiesData ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const { control, handleSubmit, setValue } = useForm<TIpsDataForm>({
    resolver: zodResolver(ipsDataSchema),
    defaultValues: {
      companyName: "",
      nit: "",
      verificationDigit: undefined,
      habilitationCode: "",
      complexityLevel: undefined,
      invoiceConsecutive: undefined,
      phone: "",
      email: "",
      ivaPercentage: undefined,
      currencySymbol: undefined,
      address: "",
      stateId: undefined,
      cityId: undefined,
      isIps: true,
      isAmbulance: false,
      electronicInvoicing: undefined,
      ownWebServices: undefined,
      apiSiigo: undefined,
      legalRepDocument: "",
      legalRepName: "",
    },
  })

  const {
    control: resolutionControl,
    handleSubmit: handleResolutionSubmit,
    reset: resetResolution,
  } = useForm<TResolutionForm>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      resolution: "",
      prefix: "",
      initialRange: undefined,
      finalRange: undefined,
      startDate: "",
      endDate: "",
      pin: "",
      typeId: undefined,
    },
  })

  const watchedValues = useWatch({ control })

  const filteredCities = cityOptions.filter((c) => {
    const city = (citiesData ?? []).find((ci) => ci.id === c.value)
    return city?.stateId === watchedValues.stateId
  })

  const onSubmit = (data: TIpsDataForm) => {
    console.log("IPS Data:", data)
    toast.success("Datos actualizados correctamente")
  }

  const handleRefresh = () => {
    toast.success("Datos actualizados")
  }

  const onResolutionSubmit = (data: TResolutionForm) => {
    console.log("Resolución:", data)
    toast.success("Resolución creada correctamente")
    resetResolution()
    setOpenResolution(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Botón Actualizar datos centrado */}
        <div className="d-flex justify-content-center mb-4">
          <Button type="default" onClick={handleRefresh}>
            Actualizar datos
          </Button>
        </div>

        <div className="d-flex gap-4" style={{ alignItems: "flex-start" }}>
          {/* Sidebar izquierdo - Logo y Firma */}
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
            {/* Logo preview */}
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
                <span style={{ color: "#bfbfbf", fontSize: 14 }}>
                  Sin logo
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Logo</div>
            <FileInput
              name="logo"
              control={control}
              label=""
              accept="image/*"
            />

            {/* Firma preview */}
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
              {watchedValues.legalRepSignature ? (
                <img
                  src={
                    typeof watchedValues.legalRepSignature === "string"
                      ? watchedValues.legalRepSignature
                      : URL.createObjectURL(watchedValues.legalRepSignature)
                  }
                  alt="Firma"
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
            <div style={{ fontWeight: 600, fontSize: 13 }}>Firma rep legal</div>
            <FileInput
              name="legalRepSignature"
              control={control}
              label=""
              accept="image/*"
            />
          </div>

          {/* Formulario principal */}
          <div style={{ flex: 1 }}>
            <GridContainer columns="col-12 col-md-6" gap="g-3">
              <Input
                name="companyName"
                label="Nombre de la empresa"
                placeholder="Nombre de la empresa"
                control={control}
              />
              <div className="d-flex gap-2">
                <div style={{ flex: 3 }}>
                  <Input
                    name="nit"
                    label="Nit"
                    placeholder="NIT"
                    control={control}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    name="verificationDigit"
                    label="DV"
                    placeholder="DV"
                    control={control}
                  />
                </div>
              </div>
              <Input
                name="habilitationCode"
                label="Código Habilitación"
                placeholder="Código de habilitación"
                control={control}
              />
              <Select
                name="complexityLevel"
                label="Complejidad IPS REPS"
                placeholder="Seleccione complejidad"
                control={control}
                options={complexityOptions}
              />
              <Input
                type="number"
                name="invoiceConsecutive"
                label="Consecutivo Factura"
                placeholder="Consecutivo"
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
                type="number"
                name="ivaPercentage"
                label="IVA (%)"
                placeholder="IVA"
                control={control}
              />
              <Select
                name="currencySymbol"
                label="Símbolo de moneda"
                placeholder="Seleccione moneda"
                control={control}
                options={currencyOptions}
              />
              <Input
                name="address"
                label="Dirección"
                placeholder="Dirección"
                control={control}
              />
              <Select
                name="stateId"
                label="Departamento"
                placeholder="Seleccione departamento"
                control={control}
                options={stateOptions}
              />
              <Select
                name="cityId"
                label="Ciudad"
                placeholder="Seleccione ciudad"
                control={control}
                options={filteredCities}
                disabled={!watchedValues.stateId}
              />
            </GridContainer>

            {/* Tipo de servicio - Checkboxes */}
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                Tipo de servicio
              </label>
              <div className="d-flex gap-4 align-items-center">
                <Checkbox
                  checked={watchedValues.isIps}
                  onChange={(e) => setValue("isIps", e.target.checked)}
                >
                  IPS
                </Checkbox>
                <Checkbox
                  checked={watchedValues.isAmbulance}
                  onChange={(e) => setValue("isAmbulance", e.target.checked)}
                >
                  Ambulancia
                </Checkbox>
                {watchedValues.isAmbulance && (
                  <Button type="primary">+ Datos Ambulancia</Button>
                )}
              </div>
            </div>

            <GridContainer columns="col-12 col-md-6" gap="g-3">
              <Select
                name="electronicInvoicing"
                label="Facturación electrónica"
                placeholder="Seleccione"
                control={control}
                options={booleanOptions}
              />
              <Select
                name="ownWebServices"
                label="Web services propia"
                placeholder="Seleccione"
                control={control}
                options={booleanOptions}
              />
              <Select
                name="apiSiigo"
                label="API SIIGO"
                placeholder="Seleccione"
                control={control}
                options={booleanOptions}
              />
              <Input
                name="legalRepDocument"
                label="Documento Rep Legal"
                placeholder="Documento del representante legal"
                control={control}
              />
              <Input
                name="legalRepName"
                label="Nombre Rep Legal"
                placeholder="Nombre del representante legal"
                control={control}
              />
            </GridContainer>

            {/* DIAN Resoluciones */}
            <div
              className="d-flex justify-content-center"
              style={{ marginTop: 16 }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                DIAN Resoluciones
              </label>
            </div>
            <div className="d-flex justify-content-center">
              <Button
                type="primary"
                onClick={() => setOpenResolution(true)}
              >
                Editar Resoluciones
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Nueva Resolución */}
      <Modal
        open={openResolution}
        onClose={() => {
          setOpenResolution(false)
          resetResolution()
        }}
        title="Nueva Resolución"
        size="lg"
      >
        <form onSubmit={handleResolutionSubmit(onResolutionSubmit)}>
          <GridContainer columns="col-12 col-md-6" gap="g-3">
            <Input
              name="resolution"
              label="Resolución"
              placeholder="Número de resolución"
              control={resolutionControl}
            />
            <Input
              name="prefix"
              label="Prefijo"
              placeholder="Prefijo"
              control={resolutionControl}
            />
            <Input
              type="number"
              name="initialRange"
              label="Rango inicial"
              placeholder="Rango inicial"
              control={resolutionControl}
            />
            <Input
              type="number"
              name="finalRange"
              label="Rango final"
              placeholder="Rango final"
              control={resolutionControl}
            />
            <Input
              type="date"
              name="startDate"
              label="Fecha inicio de vigencia"
              placeholder="Fecha inicio"
              control={resolutionControl}
            />
            <Input
              type="date"
              name="endDate"
              label="Fecha fin de vigencia"
              placeholder="Fecha fin"
              control={resolutionControl}
            />
            <Input
              name="pin"
              label="Pin"
              placeholder="Pin"
              control={resolutionControl}
            />
            <Select
              name="typeId"
              label="Tipo"
              placeholder="Seleccione tipo"
              control={resolutionControl}
              options={resolutionTypeOptions}
            />
          </GridContainer>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button
              type="default"
              onClick={() => {
                setOpenResolution(false)
                resetResolution()
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
