import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { useGetElectronicInvoicingCities } from "@/core/hooks/parameterization/electronicInvoicing/useGetElectronicInvoicingSettings"
import { useUpdateElectronicInvoiceCompany } from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import {
  TElectronicInvoiceCatalogItem,
  TElectronicInvoiceCompany,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { fileToBase64 } from "../utils"
import { companySchema, TCompanyForm } from "./schema"

function toFormValues(company: TElectronicInvoiceCompany): TCompanyForm {
  return {
    name: company.name,
    identificationType: company.identificationType,
    regimeType: company.regimeType,
    fiscalResponsibility: company.fiscalResponsibility
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean),
    operationType: company.operationType,
    companyType: company.companyType,
    address: company.address,
    stateCode: company.stateCode,
    cityCode: company.cityCode,
    postalZone: company.postalZone,
    phoneNum: company.phoneNum,
    email: company.email,
    primaryInvoiceColor: company.primaryInvoiceColor ?? "",
    // string: logo guardado (data URI); File: logo nuevo; null: quitar logo.
    logo: company.companyLogo ?? undefined,
  }
}

export function useCompanyForm(company: TElectronicInvoiceCompany, states: TElectronicInvoiceCatalogItem[]) {
  const updateCompany = useUpdateElectronicInvoiceCompany()

  const { control, handleSubmit, reset, setValue } = useForm<TCompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(company),
  })

  useEffect(() => {
    reset(toFormValues(company))
  }, [company, reset])

  const watched = useWatch({ control })

  const stateId = states.find((s) => s.code === watched.stateCode)?.id
  const { data: cities = [], isFetching: isLoadingCities } = useGetElectronicInvoicingCities(stateId)

  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.code, label: `${s.code} - ${s.name}` })),
    [states],
  )
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` })),
    [cities],
  )

  const onSubmit = async (data: TCompanyForm) => {
    let companyLogo: string | null | undefined
    if (data.logo instanceof File) companyLogo = await fileToBase64(data.logo)
    else if (data.logo === null) companyLogo = ""
    else companyLogo = undefined

    updateCompany.mutate(
      {
        name: data.name,
        identificationType: data.identificationType,
        regimeType: data.regimeType,
        fiscalResponsibility: data.fiscalResponsibility.join(";"),
        operationType: data.operationType,
        companyType: data.companyType,
        address: data.address,
        stateCode: data.stateCode,
        cityCode: data.cityCode,
        postalZone: data.postalZone,
        phoneNum: data.phoneNum,
        email: data.email,
        primaryInvoiceColor: data.primaryInvoiceColor || null,
        companyLogo,
      },
      {
        onSuccess: () => toast.success("Datos del emisor actualizados"),
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  const submitForm = handleSubmit(onSubmit, () => {
    toast.error("Revise los campos obligatorios del formulario")
  })

  const onStateChange = () => setValue("cityCode", "")
  const removeLogo = () => setValue("logo", null, { shouldDirty: true })

  return {
    control,
    watched,
    submitForm,
    stateOptions,
    cityOptions,
    isLoadingCities,
    onStateChange,
    removeLogo,
    isSaving: updateCompany.isPending,
  }
}
