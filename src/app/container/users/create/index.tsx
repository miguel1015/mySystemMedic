"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import CustomButton from "@/components/button";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import { DocumentType, TCreateUser } from "../types";
import Select from "@/components/select";
import useDictionary from "@/locales/dictionary-hook";

const createUserSchema = z
  .object({
    tipoDocumento: z.string().min(1, "Tipo de documento es obligatorio"),
    numeroDocumento: z.string().min(1, "Número de documento es obligatorio"),
    nombres: z.string().min(1, "Nombres son obligatorios"),
    apellidos: z.string().min(1, "Apellidos son obligatorios"),
    usuario: z.string().min(1, "Usuario es obligatorio"),
    perfil: z.string().min(1, "Perfil de usuario es obligatorio"),
    rol: z.string().min(1, "Rol es obligatorio"),
    estado: z.string().min(1, "Estado es obligatorio"),
    contrasena: z
      .string()
      .min(6, "Contraseña debe tener al menos 6 caracteres"),
    confirmarContrasena: z
      .string()
      .min(6, "Confirmar contraseña es obligatorio"),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  });

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function CreateUser({ setOpen }: TCreateUser) {
  const dict = useDictionary();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
      nombres: "",
      apellidos: "",
      usuario: "",
      perfil: "",
      rol: "",
      estado: "",
      contrasena: "",
      confirmarContrasena: "",
    },
  });

  const onSubmit = async (data: CreateUserForm) => {
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al crear el usuario");

      reset();
    } catch (err: any) {}
  };

  const documentTypes: DocumentType[] = [
    { label: "Cédula de Ciudadanía", value: "cc" },
    { label: "Cédula de Extranjería", value: "ce" },
    { label: "Pasaporte", value: "passport" },
    { label: "Tarjeta de Identidad", value: "ti" },
    { label: "Registro Civil", value: "rc" },
    { label: "Número de Identificación Tributaria (NIT)", value: "nit" },
    { label: "Licencia de Conducir", value: "driver_license" },
    { label: "Documento Militar", value: "military" },
    { label: "Carné de Extranjería", value: "foreigner_card" },
    { label: "Otro Documento", value: "other" },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer gap="g-3">
          <Select
            name="tipoDocumento"
            label={dict.users.typeDocument}
            placeholder={dict.users.typeDocument}
            control={control}
            options={documentTypes}
          />
          <Input
            name="numeroDocumento"
            label={dict.users.numberId}
            placeholder={dict.users.numberId}
            control={control}
          />
          <Input
            name="nombres"
            label={dict.users.names}
            placeholder={dict.users.names}
            control={control}
          />
          <Input
            name="apellidos"
            label={dict.users.lastNames}
            placeholder={dict.users.lastNames}
            control={control}
          />
          <Input
            name="usuario"
            label={dict.users.userID}
            placeholder={dict.users.userID}
            control={control}
          />
          <Input
            name="perfil"
            label={dict.users.userProfile}
            placeholder={dict.users.userProfile}
            control={control}
          />
          <Input
            name="rol"
            label={dict.users.rol}
            placeholder={dict.users.rol}
            control={control}
          />
          <Input
            name="estado"
            label={dict.users.state}
            placeholder={dict.users.state}
            control={control}
          />
          <Input
            name="contrasena"
            label={dict.users.password}
            placeholder={dict.users.password}
            type="password"
            control={control}
          />
          <Input
            name="confirmarContrasena"
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
          <CustomButton variant="primary" loading={isSubmitting}>
            {dict.users.save}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
