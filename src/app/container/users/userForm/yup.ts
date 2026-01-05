import { z } from "zod";

export const createUserSchema = z
  .object({
    documentTypeId: z
      .number({
        required_error: "Tipo de documento es obligatorio",
        invalid_type_error: "Tipo de documento es obligatorio",
      })
      .positive("Tipo de documento es obligatorio"),
    documentNumber: z.string().min(1, "Número de documento es obligatorio"),
    firstName: z.string().min(1, "Nombres son obligatorios"),
    lastName: z.string().min(1, "Apellidos son obligatorios"),
    username: z.string().min(1, "Usuario es obligatorio"),
    userProfileId: z
      .number({
        required_error: "Perfil de usuario es obligatorio",
        invalid_type_error: "Perfil de usuario es obligatorio",
      })
      .positive("Perfil de usuario es obligatorio"),
    userRoleId: z
      .number({
        required_error: "Rol es obligatorio",
        invalid_type_error: "Rol es obligatorio",
      })
      .positive("Rol es obligatorio"),
    userStatusId: z
      .number({
        required_error: "Estado es obligatorio",
        invalid_type_error: "Estado es obligatorio",
      })
      .positive("Estado es obligatorio"),
    cellphone: z
      .number({
        required_error: "Celular es obligatorio",
        invalid_type_error: "Celular es obligatorio",
      })
      .positive("Celular es obligatorio"),
    telephone: z
      .number({
        required_error: "Teléfono es obligatorio",
        invalid_type_error: "Teléfono es obligatorio",
      })
      .positive("Celular es obligatorio"),
    licenseCard: z.string().optional(),
    email: z.string().email("Email inválido"),

    // Opcional: solo obligatorio cuando NO es edición
    password: z.string().optional(),
    confirmarContraseña: z.string().optional(),
    file: z
      .instanceof(File)
      .optional()
      .refine(
        (file) =>
          !file ||
          [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].includes(file.type),
        "Tipo de archivo no permitido"
      ),
  })
  .refine(
    (data) => !data.password || data.password === data.confirmarContraseña,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmarContraseña"],
    }
  );

export type CreateUserForm = z.infer<typeof createUserSchema>;
