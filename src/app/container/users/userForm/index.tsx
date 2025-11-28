"use client";

import CustomButton from "@/components/button";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import Select from "@/components/select";
import { useCreateUser } from "@/core/hooks/users/useCreateUser";
import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes";
import { useUserProfiles } from "@/core/hooks/users/useProfile";
import { useUserRoles } from "@/core/hooks/users/useRole";
import { useUserStatuses } from "@/core/hooks/users/useStatuses";
import useDictionary from "@/locales/dictionary-hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { TCreateUser } from "../types";
import { useUpdateUser } from "@/core/hooks/users/useUpdateUser";
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser";
import { useEffect } from "react";
import UserFormSkeleton from "./useFormSkeleton";

const createUserSchema = z
  .object({
    documentTypeId: z.number().min(1, "Tipo de documento es obligatorio"),
    documentNumber: z.string().min(1, "Número de documento es obligatorio"),
    firstName: z.string().min(1, "Nombres son obligatorios"),
    lastName: z.string().min(1, "Apellidos son obligatorios"),
    username: z.string().min(1, "Usuario es obligatorio"),
    userProfileId: z.number().min(1, "Perfil de usuario es obligatorio"),
    userRoleId: z.number().min(1, "Rol es obligatorio"),
    userStatusId: z.number().min(1, "Estado es obligatorio"),
    email: z.string().email("Email inválido"),

    // Opcional: solo obligatorio cuando NO es edición
    password: z.string().optional(),
    confirmarContraseña: z.string().optional(),
  })
  .refine(
    (data) => !data.password || data.password === data.confirmarContraseña,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmarContraseña"],
    }
  );

type CreateUserForm = z.infer<typeof createUserSchema>;

const UserForm: React.FC<TCreateUser> = ({ setOpen, editUserId }) => {
  const { data: dataRol } = useUserRoles();
  const { data: dataProfile } = useUserProfiles();
  const { data: dataDocumentType } = useUserDocumentType();
  const { data: dataStatuses } = useUserStatuses();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: getUser, isLoading: loadingUser } = useGetUserById(
    Number(editUserId)
  );

  const roleOptions = (dataRol ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));
  const profilesOptions = (dataProfile ?? []).map((r) => ({
    value: r.id,
    label: r.name,
    roleId: r.userRoleId,
  }));
  const documentTypesOptions = (dataDocumentType ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));
  const statusesOptions = (dataStatuses ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));
  const dict = useDictionary();

  const { control, handleSubmit, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      documentTypeId: 0,
      documentNumber: "",
      firstName: "",
      lastName: "",
      username: "",
      userProfileId: 0,
      userRoleId: 0,
      userStatusId: undefined,
      email: "",
      password: "",
      confirmarContraseña: "",
    },
  });
  const selectedRoleId = useWatch({ control });
  const filteredProfiles = profilesOptions.filter(
    (p) => p.roleId === selectedRoleId.userRoleId
  );

  const onSubmit = (data: CreateUserForm) => {
    if (editUserId) {
      const updatePayload = {
        ...data,
        password: undefined,
        confirmarContraseña: undefined,
      };

      updateUser.mutate(
        { id: editUserId, data: updatePayload },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Usuario actualizado correctamente");
          },
          onError: () => {
            toast.error("Error actualizando usuario");
          },
        }
      );

      return;
    }

    createUser.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Usuario creado correctamente");
      },
      onError: () => {
        toast.error("Error creando usuario");
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

        // nunca llenar contraseñas cuando editas
        password: "",
        confirmarContraseña: "",
      });
    }
  }, [editUserId, getUser, reset]);

  if (loadingUser) {
    return <UserFormSkeleton />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer gap="g-3">
          <Select
            name="documentTypeId"
            label={dict.users.typeDocument}
            placeholder={dict.users.typeDocument}
            control={control}
            options={documentTypesOptions}
          />
          <Input
            name="documentNumber"
            label={dict.users.numberId}
            placeholder={dict.users.numberId}
            control={control}
          />
          <Input
            name="firstName"
            label={dict.users.names}
            placeholder={dict.users.names}
            control={control}
          />
          <Input
            name="lastName"
            label={dict.users.lastNames}
            placeholder={dict.users.lastNames}
            control={control}
          />
          <Input
            name="username"
            label={dict.users.userID}
            placeholder={dict.users.userID}
            control={control}
          />
          <Select
            name="userRoleId"
            label={dict.users.rol}
            placeholder={dict.users.rol}
            control={control}
            options={roleOptions}
          />
          <Select
            name="userProfileId"
            label={dict.users.userProfile}
            placeholder={dict.users.userProfile}
            control={control}
            options={filteredProfiles}
            disabled={!selectedRoleId.userRoleId}
          />
          <Select
            name="userStatusId"
            label={dict.users.state}
            placeholder={dict.users.state}
            control={control}
            options={statusesOptions}
          />
          <Input
            name="email"
            label={dict.users.email}
            placeholder={dict.users.email}
            control={control}
          />
          {!editUserId && (
            <>
              <Input
                name="password"
                label={dict.users.password}
                placeholder={dict.users.password}
                type="password"
                control={control}
              />
              <Input
                name="confirmarContraseña"
                label={dict.users.confirmPassword}
                placeholder={dict.users.confirmPassword}
                type="password"
                control={control}
              />
            </>
          )}
        </GridContainer>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <CustomButton variant="secondary" onClick={() => setOpen(false)}>
            {dict.users.cancel}
          </CustomButton>
          <CustomButton
            variant="primary"
            loading={createUser.isPending || updateUser.isPending}
          >
            {dict.users.save}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
