import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCreateUser } from "@/core/hooks/users/useCreateUser";
import { useUpdateUser } from "@/core/hooks/users/useUpdateUser";
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser";
import { TCreateUser } from "../types";
import { CreateUserForm, createUserSchema } from "./yup";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useUserForm({
  setOpen,
  editUserId,
  setEditUserId,
}: Pick<TCreateUser, "setOpen" | "editUserId" | "setEditUserId">) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: getUser, isLoading: loadingUser } = useGetUserById(
    Number(editUserId)
  );

  const { control, handleSubmit, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      documentTypeId: undefined,
      documentNumber: "",
      firstName: "",
      lastName: "",
      username: "",
      userProfileId: undefined,
      phone: "",
      telephone: "",
      userRoleId: undefined,
      userStatusId: undefined,
      email: "",
      password: "",
      confirmarContraseña: "",
    },
  });

  const watchedValues = useWatch({ control });

  const filteredProfilesByRole = (
    profiles: { value: number; label: string; roleId: number }[]
  ) => profiles.filter((p) => p.roleId === watchedValues.userRoleId);

  const onSubmit = async (data: CreateUserForm) => {
    const payload = { ...data };

    if (payload.signature instanceof File) {
      payload.signature = await fileToBase64(payload.signature);
    }

    if (editUserId) {
      const updatePayload = {
        ...payload,
        isActive: true,
        password: undefined,
        confirmarContraseña: undefined,
      };

      updateUser.mutate(
        { id: editUserId, data: updatePayload },
        {
          onSuccess: () => {
            setOpen(false);
            setEditUserId(null);
            toast.success("Usuario actualizado correctamente");
          },
          onError: (err: Error) => {
            toast.error(err.message);
          },
        }
      );

      return;
    }

    createUser.mutate(payload, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Usuario creado correctamente");
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  };

  useEffect(() => {
    if (editUserId && getUser) {
      reset({
        documentTypeId: getUser.documentTypeId ?? 0,
        documentNumber: getUser.documentNumber ?? "",
        firstName: getUser.firstName ?? "",
        lastName: getUser.lastName ?? "",
        username: getUser.username ?? "",
        userProfileId: getUser.userProfileId ?? 0,
        userRoleId: getUser.userRoleId ?? 0,
        userStatusId: getUser.userStatusId ?? 0,
        email: getUser.email ?? "",
        phone: getUser.phone ?? "",
        telephone: getUser.telephone ?? "",
        signature: getUser.signature ?? undefined,
        password: "",
        confirmarContraseña: "",
      });
    }
  }, [editUserId, getUser, reset]);

  return {
    control,
    handleSubmit,
    watchedValues,
    filteredProfilesByRole,
    onSubmit,
    loadingUser,
    isSubmitting: createUser.isPending || updateUser.isPending,
  };
}
