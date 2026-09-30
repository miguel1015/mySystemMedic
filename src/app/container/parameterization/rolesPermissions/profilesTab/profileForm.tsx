"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Button } from "antd"
import Input from "@/components/input"
import TextArea from "@/components/textArea"
import { useSaveAccessProfile } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessProfile, TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import { nameAndDescriptionSchema, TNameAndDescriptionForm } from "../roleForm"

interface ProfileFormProps {
  role: TAccessRole
  profile?: TAccessProfile | null
  onDone: () => void
}

export default function ProfileForm({ role, profile, onDone }: ProfileFormProps) {
  const saveProfile = useSaveAccessProfile()

  const { control, handleSubmit, reset } = useForm<TNameAndDescriptionForm>({
    resolver: zodResolver(nameAndDescriptionSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    reset({ name: profile?.name ?? "", description: profile?.description ?? "" })
  }, [profile, reset])

  const onSubmit = (data: TNameAndDescriptionForm) => {
    saveProfile.mutate(
      {
        roleId: role.id,
        id: profile?.id,
        data: {
          name: data.name,
          description: data.description || null,
          isActive: profile?.isActive ?? true,
        },
      },
      {
        onSuccess: () => {
          toast.success(profile ? "Perfil actualizado" : "Perfil creado")
          onDone()
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="rp-cell-secondary mb-3">
        Rol: <strong>{role.name}</strong>. Los usuarios con este perfil tendrán las vistas de ese rol.
      </p>
      <Input name="name" label="Nombre del perfil" placeholder="Ej: Médico general" control={control} />
      <TextArea name="description" label="Descripción" placeholder="Opcional" control={control} rows={2} />

      <div className="d-flex justify-content-end gap-2">
        <Button onClick={onDone} disabled={saveProfile.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={saveProfile.isPending}>
          {profile ? "Guardar cambios" : "Crear perfil"}
        </Button>
      </div>
    </form>
  )
}
