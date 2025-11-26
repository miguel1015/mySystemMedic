"use client";

import CustomButton from "@/components/button";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import Select from "@/components/select";
import { useUserProfiles } from "@/core/hooks/users/useProfile";
import useDictionary from "@/locales/dictionary-hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUserRoles } from "../../../../core/hooks/users/roles/useRole";
import { DocumentType, TCreateUser } from "../types";
import { useCreateUser } from "@/core/hooks/users/useCreateUser";
import toast from "react-hot-toast";

const createUserSchema = z
  .object({
    documentTypeId: z.number().min(1, "Tipo de documento es obligatorio"),
    documentNumber: z.string().min(1, "Número de documento es obligatorio"),
    firstName: z.string().min(1, "Nombres son obligatorios"),
    lastName: z.string().min(1, "Apellidos son obligatorios"),
    username: z.string().min(1, "Usuario es obligatorio"),
    userProfileId: z.number().min(1, "Perfil de usuario es obligatorio"),
    userRoleId: z.number().min(1, "Rol es obligatorio"),
    userStatusId: z.number().min(1, "Debe ser mayor o igual a 1"),
    email: z.string().min(1, "Email es obligatorio"),
    password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
    confirmarContraseña: z
      .string()
      .min(6, "Confirmar contraseña es obligatorio"),
  })
  .refine((data) => data.password === data.confirmarContraseña, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContraseña"],
  });

type CreateUserForm = z.infer<typeof createUserSchema>;

const CreateUser: React.FC<TCreateUser> = ({ setOpen }) => {
  const { data: dataRol } = useUserRoles();
  const { data: dataProfile } = useUserProfiles();
  const createUser = useCreateUser();

  const roleOptions = (dataRol ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));
  const profilesOptions = (dataProfile ?? []).map((r) => ({
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

  const onSubmit = (data: CreateUserForm) => {
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

  const documentTypes: DocumentType[] = [
    { label: "Cédula de Ciudadanía", value: 1 },
    { label: "Cédula de Extranjería", value: 2 },
    { label: "Pasaporte", value: 3 },
    { label: "Tarjeta de Identidad", value: 4 },
    { label: "Registro Civil", value: 5 },
    { label: "Número de Identificación Tributaria (NIT)", value: 6 },
    { label: "Licencia de Conducir", value: 7 },
    { label: "Documento Militar", value: 8 },
    { label: "Carné de Extranjería", value: 9 },
    { label: "Otro Documento", value: 10 },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer gap="g-3">
          <Select
            name="documentTypeId"
            label={dict.users.typeDocument}
            placeholder={dict.users.typeDocument}
            control={control}
            options={documentTypes}
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
            name="userProfileId"
            label={dict.users.userProfile}
            placeholder={dict.users.userProfile}
            control={control}
            options={profilesOptions}
          />
          <Select
            name="userRoleId"
            label={dict.users.rol}
            placeholder={dict.users.rol}
            control={control}
            options={roleOptions}
          />
          <Input
            type="number"
            name="userStatusId"
            label={dict.users.state}
            placeholder={dict.users.state}
            control={control}
          />
          <Input
            name="email"
            label={dict.users.email}
            placeholder={dict.users.email}
            control={control}
          />
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
        </GridContainer>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <CustomButton variant="secondary" onClick={() => setOpen(false)}>
            {dict.users.cancel}
          </CustomButton>
          <CustomButton variant="primary" loading={createUser.isPending}>
            {dict.users.save}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
