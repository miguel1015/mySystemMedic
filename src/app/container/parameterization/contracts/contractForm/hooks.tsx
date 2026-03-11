import { useInsurers } from "../../../../../core/hooks/utils/useInsurer"
import { useContractCatalogs } from "../../../../../core/hooks/parameterization/contracts/useContractCatalogs"

const toOptionsCatalog = (data: { id: number; description: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.description }))

const toOptions = (data: { id: number; name: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.name }))

export const useContractOptions = () => {
  const { data: dataInsurers } = useInsurers()
  const { data: catalogs } = useContractCatalogs()

  return {
    insurersOptions: toOptions(dataInsurers),
    valueMethodsOptions: toOptionsCatalog(catalogs?.valueMethods),
    contractTypesOptions: toOptionsCatalog(catalogs?.benefitPlanContractTypes),
    epsRegimensOptions: toOptionsCatalog(catalogs?.epsRegimes),
    userTypesOptions: toOptionsCatalog(catalogs?.healthUserTypes),
    paymentModalitiesOptions: toOptionsCatalog(catalogs?.paymentModalities),
    coveragesOptions: toOptionsCatalog(catalogs?.coverages),
  }
}
