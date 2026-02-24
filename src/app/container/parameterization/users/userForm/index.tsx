"use client";

import GridContainer from "@/components/componentLayout";
import FileInput from "@/components/fileInput";
import Input from "@/components/input";
import Select from "@/components/select";
import { useCreateUser } from "@/core/hooks/users/useCreateUser";
import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes";
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser";
import { useUserProfiles } from "@/core/hooks/users/useProfile";
import { useUserRoles } from "@/core/hooks/users/useRole";
import { useUserStatuses } from "@/core/hooks/users/useStatuses";
import { useUpdateUser } from "@/core/hooks/users/useUpdateUser";
import useDictionary from "@/locales/dictionary-hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { TCreateUser } from "../types";
import UserFormSkeleton from "./useFormSkeleton";
import { CreateUserForm, createUserSchema } from "./yup";

const UserForm: React.FC<TCreateUser> = ({
  setOpen,
  editUserId,
  setEditUserId,
}) => {
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
      documentTypeId: undefined,
      documentNumber: "",
      firstName: "",
      lastName: "",
      username: "",
      userProfileId: undefined,
      cellphone: undefined,
      telephone: undefined,
      userRoleId: undefined,
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

    createUser.mutate(data, {
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
            type="number"
            name="cellphone"
            label={dict.users.cellphone}
            placeholder={dict.users.cellphone}
            control={control}
          />
          <Input
            type="number"
            name="telephone"
            label={dict.users.telephone}
            placeholder={dict.users.telephone}
            control={control}
          />
          <Input
            name="licenseCard"
            label={dict.users.licenseCard}
            placeholder={dict.users.licenseCard}
            control={control}
          />

          <Input
            name="email"
            label={dict.users.email}
            placeholder={dict.users.email}
            control={control}
          />
          {!editUserId && (
            <Input
              name="password"
              label={dict.users.password}
              placeholder={dict.users.password}
              type="password"
              control={control}
            />
          )}
          {!editUserId && (
            <Input
              name="confirmarContraseña"
              label={dict.users.confirmPassword}
              placeholder={dict.users.confirmPassword}
              type="password"
              control={control}
            />
          )}
          <FileInput name="file" control={control} label="Documento" />
        </GridContainer>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button type="default" onClick={() => setOpen(false)}>
            {dict.users.cancel}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createUser.isPending || updateUser.isPending}
          >
            {dict.users.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
