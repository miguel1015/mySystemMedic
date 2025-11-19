"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import CustomButton from "@/components/button";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import { TCreateUser } from "../types";

// ----- SCHEMA ZOD -----
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

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer gap="g-3">
          <Input
            name="tipoDocumento"
            label="Tipo de documento"
            placeholder="Tipo de documento"
            control={control}
          />
          <Input
            name="numeroDocumento"
            label="Número de documento"
            placeholder="Número de documento"
            control={control}
          />
          <Input
            name="nombres"
            label="Nombres"
            placeholder="Nombres"
            control={control}
          />
          <Input
            name="apellidos"
            label="Apellidos"
            placeholder="Apellidos"
            control={control}
          />
          <Input
            name="usuario"
            label="Usuario"
            placeholder="Usuario"
            control={control}
          />
          <Input
            name="perfil"
            label="Perfil de usuario"
            placeholder="Perfil"
            control={control}
          />
          <Input name="rol" label="Rol" placeholder="Rol" control={control} />
          <Input
            name="estado"
            label="Estado"
            placeholder="Estado"
            control={control}
          />
          <Input
            name="contrasena"
            label="Contraseña"
            placeholder="Contraseña"
            type="password"
            control={control}
          />
          <Input
            name="confirmarContrasena"
            label="Confirmar Contraseña"
            placeholder="Confirmar Contraseña"
            type="password"
            control={control}
          />
        </GridContainer>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <CustomButton variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </CustomButton>
          <CustomButton variant="primary" loading={isSubmitting}>
            Guardar
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
