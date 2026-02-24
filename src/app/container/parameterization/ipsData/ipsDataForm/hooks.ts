import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCities } from "@/core/hooks/utils/useCities";
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider";
import { useUpdateProvider } from "@/core/hooks/parameterization/providers/useUpdateProvider";
import { providerSchema, providerDefaultValues, TProviderForm } from "./schema";

const PROVIDER_ID = 32;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useProviderForm() {
  const { data: provider, isLoading } = useGetProvider(PROVIDER_ID);
  const updateProvider = useUpdateProvider();
  const { data: citiesData } = useCities();

  const cityOptions = (citiesData ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const { control, handleSubmit, reset, setValue } = useForm<TProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: providerDefaultValues,
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (provider) {
      reset({
        name: provider.name ?? "",
        identificationType: provider.identificationType ?? "",
        nit: provider.nit ?? "",
        verificationDigit: provider.verificationDigit ?? "",
        address: provider.address ?? "",
        phone: provider.phone ?? "",
        cityId: provider.cityId,
        legalRepresentative: provider.legalRepresentative ?? "",
        documentType: provider.documentType ?? "",
        documentNumber: provider.documentNumber ?? "",
        legalRepresentativeSign: provider.legalRepresentativeSign ?? undefined,
        email: provider.email ?? "",
        logo: provider.logo ?? undefined,
        enableCode: provider.enableCode ?? "",
        regimen: provider.regimen ?? "",
        invoiceIssuerName: provider.invoiceIssuerName ?? "",
        invoiceIssuerSign: provider.invoiceIssuerSign ?? undefined,
        applyTax: provider.applyTax ?? false,
      });
    }
  }, [provider, reset]);

  const onSubmit = async (data: TProviderForm) => {
    const payload = { ...data };

    if (payload.logo instanceof File) {
      payload.logo = await fileToBase64(payload.logo);
    }
    if (payload.legalRepresentativeSign instanceof File) {
      payload.legalRepresentativeSign = await fileToBase64(
        payload.legalRepresentativeSign,
      );
    }
    if (payload.invoiceIssuerSign instanceof File) {
      payload.invoiceIssuerSign = await fileToBase64(payload.invoiceIssuerSign);
    }

    updateProvider.mutate(
      { id: PROVIDER_ID, data: payload },
      {
        onSuccess: () => {
          toast.success("Datos actualizados correctamente");
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      },
    );
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    setValue,
    watchedValues,
    cityOptions,
    isLoading,
    isUpdating: updateProvider.isPending,
  };
}
