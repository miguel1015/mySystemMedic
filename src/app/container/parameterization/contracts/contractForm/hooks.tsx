import { useInsurers } from "../../../../../core/hooks/utils/useInsurer"
import { useValueMethods } from "../../../../../core/hooks/utils/useValueMethods"
import { useContractTypes } from "../../../../../core/hooks/utils/useContractTypes"
import { useEpsRegimens } from "../../../../../core/hooks/utils/useEpsRegimens"
import { useUserTypes } from "../../../../../core/hooks/utils/useUserTypes"
import { usePaymentModalities } from "../../../../../core/hooks/utils/usePaymentModalities"
import { useCoverages } from "../../../../../core/hooks/utils/useCoverages"

const toOptions = (data: { id: number; name: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.name }))

export const useContractOptions = () => {
  const { data: dataInsurers } = useInsurers()
  const { data: dataValueMethods } = useValueMethods()
  const { data: dataContractTypes } = useContractTypes()
  const { data: dataEpsRegimens } = useEpsRegimens()
  const { data: dataUserTypes } = useUserTypes()
  const { data: dataPaymentModalities } = usePaymentModalities()
  const { data: dataCoverages } = useCoverages()

  return {
    insurersOptions: toOptions(dataInsurers),
    valueMethodsOptions: toOptions(dataValueMethods),
    contractTypesOptions: toOptions(dataContractTypes),
    epsRegimensOptions: toOptions(dataEpsRegimens),
    userTypesOptions: toOptions(dataUserTypes),
    paymentModalitiesOptions: toOptions(dataPaymentModalities),
    coveragesOptions: toOptions(dataCoverages),
  }
}
