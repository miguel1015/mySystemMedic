"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Alert, Button, Card, Select as AntdSelect, Tag } from "antd"
import Input from "@/components/input"
import GridContainer from "@/components/componentLayout"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import {
  useChangeElectronicInvoiceEnvironment,
  useSaveElectronicInvoiceSoftware,
} from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import {
  TElectronicInvoiceEnvironment,
  TElectronicInvoiceResolution,
  TElectronicInvoiceSoftware,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { ENVIRONMENT_LABELS, ENVIRONMENT_OPTIONS } from "../catalogs"
import { daysUntil } from "../utils"

const softwareSchema = z.object({
  dianCode: z.string().trim().min(1, "El identificador del software es obligatorio"),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  softwarePin: z.string().optional(),
  technicalKey: z.string().optional(),
})

type TSoftwareForm = z.infer<typeof softwareSchema>

interface SoftwareTabProps {
  software?: TElectronicInvoiceSoftware | null
  resolutions: TElectronicInvoiceResolution[]
}

export const environmentColor = (environment?: string) =>
  environment === "3" ? "green" : environment === "2" ? "gold" : "blue"

export default function SoftwareTab({ software, resolutions }: SoftwareTabProps) {
  const isNew = !software
  const saveSoftware = useSaveElectronicInvoiceSoftware()
  const changeEnvironment = useChangeElectronicInvoiceEnvironment()

  const { control, handleSubmit, reset, setError } = useForm<TSoftwareForm>({
    resolver: zodResolver(softwareSchema),
    defaultValues: { dianCode: "", name: "", softwarePin: "", technicalKey: "" },
  })

  useEffect(() => {
    reset({
      dianCode: software?.dianCode ?? "",
      name: software?.name ?? "",
      softwarePin: "",
      technicalKey: "",
    })
  }, [software, reset])

  const onSubmit = (data: TSoftwareForm) => {
    if (isNew) {
      let valid = true
      if (!data.softwarePin?.trim()) {
        setError("softwarePin", { message: "El PIN es obligatorio al registrar el software" })
        valid = false
      }
      if (!data.technicalKey?.trim()) {
        setError("technicalKey", { message: "La clave técnica es obligatoria al registrar el software" })
        valid = false
      }
      if (!valid) return
    }

    saveSoftware.mutate(
      {
        dianCode: data.dianCode,
        name: data.name,
        softwarePin: data.softwarePin?.trim() || undefined,
        technicalKey: data.technicalKey?.trim() || undefined,
      },
      {
        onSuccess: () => toast.success(isNew ? "Software registrado" : "Software actualizado"),
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  // ===== Ambiente =====
  const [targetEnvironment, setTargetEnvironment] = useState<TElectronicInvoiceEnvironment | undefined>()
  const [targetResolutionId, setTargetResolutionId] = useState<number | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const productionResolutions = useMemo(
    () => resolutions.filter((r) => !r.isTestResolution && daysUntil(r.endDate) >= 0),
    [resolutions],
  )

  const toProduction = targetEnvironment === "3"
  const canChange =
    !!software &&
    !!targetEnvironment &&
    targetEnvironment !== software.environment &&
    (!toProduction || !!targetResolutionId)

  const confirmEnvironmentChange = () => {
    if (!targetEnvironment) return
    changeEnvironment.mutate(
      { environment: targetEnvironment, resolutionId: toProduction ? targetResolutionId : undefined },
      {
        onSuccess: () => {
          toast.success(`Ambiente cambiado a ${ENVIRONMENT_LABELS[targetEnvironment]}`)
          setConfirmOpen(false)
          setTargetEnvironment(undefined)
          setTargetResolutionId(undefined)
        },
        onError: (err: Error) => {
          toast.error(err.message)
          setConfirmOpen(false)
        },
      },
    )
  }

  const secretHelper = (configured?: boolean) =>
    configured ? "Configurado. Déjelo vacío para conservar el valor actual." : undefined

  return (
    <div className="d-flex flex-column gap-4">
      <Card title="Software DIAN" size="small">
        {isNew && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="No hay software de facturación registrado. Al guardarlo se crea en ambiente de pruebas."
          />
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <GridContainer columns="col-12 col-md-6" gap="g-3">
            <Input
              name="dianCode"
              label="Identificador del software (Software ID)"
              placeholder="Ej: 0d4b2880-6347-4a2c-9557-e14d5c4a6f5b"
              control={control}
            />
            <Input name="name" label="Nombre del software" placeholder="Nombre" control={control} />
            <Input
              name="softwarePin"
              type="password"
              label="PIN del software"
              placeholder={software?.hasSoftwarePin ? "••••••" : "PIN"}
              autoComplete="new-password"
              helperText={secretHelper(software?.hasSoftwarePin)}
              control={control}
            />
            <Input
              name="technicalKey"
              type="password"
              label="Clave técnica"
              placeholder={software?.hasTechnicalKey ? "••••••" : "Clave técnica"}
              autoComplete="new-password"
              helperText={secretHelper(software?.hasTechnicalKey)}
              control={control}
            />
          </GridContainer>
          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit" loading={saveSoftware.isPending}>
              {isNew ? "Registrar software" : "Guardar software"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Ambiente" size="small">
        {software ? (
          <>
            <div style={{ marginBottom: 16 }}>
              Ambiente actual:{" "}
              <Tag color={environmentColor(software.environment)}>
                {ENVIRONMENT_LABELS[software.environment] ?? software.environment}
              </Tag>
            </div>

            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="En pruebas y habilitación se usa siempre la resolución de pruebas de la DIAN (18760000001 - SETP). Al pasar a producción se debe elegir la resolución real con la que se numerarán las facturas."
            />

            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Nuevo ambiente</label>
                <AntdSelect
                  style={{ width: "100%" }}
                  placeholder="Seleccione"
                  value={targetEnvironment}
                  onChange={(value: TElectronicInvoiceEnvironment) => {
                    setTargetEnvironment(value)
                    setTargetResolutionId(undefined)
                  }}
                  options={ENVIRONMENT_OPTIONS.filter((o) => o.value !== software.environment)}
                />
              </div>
              {toProduction && (
                <div className="col-12 col-md-5">
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                    Resolución de producción
                  </label>
                  <AntdSelect
                    style={{ width: "100%" }}
                    placeholder={productionResolutions.length ? "Seleccione" : "No hay resoluciones de producción vigentes"}
                    value={targetResolutionId}
                    onChange={(value: number) => setTargetResolutionId(value)}
                    options={productionResolutions.map((r) => ({
                      value: r.resolutionId,
                      label: `${r.prefix} - ${r.resolutionNum} (${r.startRange} a ${r.endRange})`,
                    }))}
                  />
                </div>
              )}
              <div className="col-12 col-md-3">
                <Button
                  type="primary"
                  danger={toProduction}
                  disabled={!canChange}
                  onClick={() => setConfirmOpen(true)}
                  style={{ marginBottom: 16 }}
                >
                  Cambiar ambiente
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Alert type="info" showIcon message="Registre primero el software DIAN." />
        )}
      </Card>

      <ModalConfirm
        open={confirmOpen}
        title="Cambiar ambiente de facturación"
        subtitle={
          toProduction
            ? "Las facturas que se emitan desde ahora se enviarán a la DIAN en PRODUCCIÓN, con validez fiscal real. ¿Desea continuar?"
            : `Las facturas se enviarán al ambiente de ${targetEnvironment ? ENVIRONMENT_LABELS[targetEnvironment] : ""} con la resolución de pruebas. ¿Desea continuar?`
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmEnvironmentChange}
        loading={changeEnvironment.isPending}
        confirmText="Sí, cambiar"
      />
    </div>
  )
}
