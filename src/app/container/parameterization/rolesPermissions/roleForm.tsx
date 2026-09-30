"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Button } from "antd"
import Input from "@/components/input"
import TextArea from "@/components/textArea"
import { useSaveAccessRole } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessRole } from "@/core/interfaces/parameterization/accessControl"

// Mismos límites que el backend (UserRoles.Name 100, Description 250).
export const nameAndDescriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().trim().max(250, "Máximo 250 caracteres").optional(),
})

export type TNameAndDescriptionForm = z.infer<typeof nameAndDescriptionSchema>

interface RoleFormProps {
  role?: TAccessRole | null
  onDone: (role?: TAccessRole) => void
}

export default function RoleForm({ role, onDone }: RoleFormProps) {
  const saveRole = useSaveAccessRole()

  const { control, handleSubmit, reset } = useForm<TNameAndDescriptionForm>({
    resolver: zodResolver(nameAndDescriptionSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    reset({ name: role?.name ?? "", description: role?.description ?? "" })
  }, [role, reset])

  const onSubmit = (data: TNameAndDescriptionForm) => {
    saveRole.mutate(
      {
        id: role?.id,
        data: {
          name: data.name,
          description: data.description || null,
          isActive: role?.isActive ?? true,
        },
      },
      {
        onSuccess: (saved) => {
          toast.success(role ? "Rol actualizado" : `Rol «${saved.name}» creado`)
          onDone(saved)
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        name="name"
        label="Nombre del rol"
        placeholder="Ej: Coordinador de facturación"
        control={control}
        disabled={role?.isSystem}
        helperText={role?.isSystem ? "Es un rol del sistema: su nombre no se puede cambiar." : undefined}
      />
      <TextArea
        name="description"
        label="Descripción"
        placeholder="¿Qué hace este rol?"
        control={control}
        rows={3}
      />

      {!role && (
        <p className="rp-cell-secondary mb-3">
          El rol se crea sin vistas. Después de crearlo, marca en «Vistas y permisos» lo que podrá ver.
        </p>
      )}

      <div className="d-flex justify-content-end gap-2">
        <Button onClick={() => onDone()} disabled={saveRole.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={saveRole.isPending}>
          {role ? "Guardar cambios" : "Crear rol"}
        </Button>
      </div>
    </form>
  )
}
