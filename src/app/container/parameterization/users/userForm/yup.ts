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
    phone: z.string().min(1, "Celular es obligatorio"),
    telephone: z.string().min(1, "Teléfono es obligatorio"),
    licenseCard: z.string().optional(),
    signature: z.any().optional(),
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

export type CreateUserForm = z.infer<typeof createUserSchema>;
