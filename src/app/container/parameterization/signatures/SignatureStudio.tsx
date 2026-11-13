"use client"

import { useCallback, useState } from "react"
import { Button, Input, Segmented } from "antd"
import { EditOutlined, FontSizeOutlined, PictureOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import type { SignatureKind, SignatureTemplate } from "@/core/interfaces/parameterization/signatures"
import {
  useCreateSignature,
  useUpdateSignature,
} from "@/core/hooks/parameterization/signatures/useSignatures"
import DrawPad from "./DrawPad"
import TypePad from "./TypePad"
import UploadPad from "./UploadPad"
import SignaturePreview from "./SignaturePreview"
import { INK_COLORS, type ExportedSignature, type InkKey } from "@/core/utils/signatureImage"
import styles from "./signatures.module.scss"

export const METHOD_LABELS: Record<SignatureKind, string> = {
  drawn: "Dibujada",
  typed: "Escrita",
  uploaded: "Subida",
}

const METHOD_OPTIONS = [
  { value: "drawn", label: "Dibujar", icon: <EditOutlined /> },
  { value: "typed", label: "Escribir", icon: <FontSizeOutlined /> },
  { value: "uploaded", label: "Subir foto", icon: <PictureOutlined /> },
]

const TIPS: Record<SignatureKind, React.ReactNode> = {
  drawn: (
    <>
      <strong>Consejo:</strong> con lápiz digital o en el celular el trazo queda más natural que con
      el mouse. Si no le gusta, use Deshacer: no hace falta empezar de nuevo.
    </>
  ),
  typed: (
    <>
      <strong>Consejo:</strong> escriba el nombre como firma la persona (por ejemplo, la inicial y el
      primer apellido). Revise la vista previa antes de guardar.
    </>
  ),
  uploaded: (
    <>
      <strong>Consejo:</strong> si quedan manchas o sombras del papel, mueva Limpieza del fondo hacia
      la izquierda. Si el trazo se ve cortado, muévala a la derecha.
    </>
  ),
}

interface Props {
  // Firma a editar; null para crear una nueva.
  signature: SignatureTemplate | null
  initialMethod?: SignatureKind
  onDone: () => void
  onCancel: () => void
}

/** Crea o edita una firma de la biblioteca: dibujarla, escribirla o subir una foto. */
export default function SignatureStudio({ signature, initialMethod = "drawn", onDone, onCancel }: Props) {
  const isEdit = signature !== null
  const [method, setMethod] = useState<SignatureKind>(initialMethod)
  const [ink, setInk] = useState<InkKey>("black")
  const [name, setName] = useState(signature?.name ?? "")
  const [nameTouched, setNameTouched] = useState(false)
  const [results, setResults] = useState<Record<SignatureKind, ExportedSignature | null>>({
    drawn: null,
    typed: null,
    uploaded: null,
  })
  // La firma escrita se monta la primera vez que se abre, con el nombre ya escrito.
  const [typedSeed, setTypedSeed] = useState<string | null>(initialMethod === "typed" ? name : null)

  const createSignature = useCreateSignature()
  const updateSignature = useUpdateSignature()
  const saving = createSignature.isPending || updateSignature.isPending

  const setDrawn = useCallback((r: ExportedSignature | null) => setResults((p) => ({ ...p, drawn: r })), [])
  const setTyped = useCallback((r: ExportedSignature | null) => setResults((p) => ({ ...p, typed: r })), [])
  const setUploaded = useCallback(
    (r: ExportedSignature | null) => setResults((p) => ({ ...p, uploaded: r })),
    [],
  )

  const current = results[method]
  // Al editar, mientras no se cree una firma nueva se conserva la imagen actual.
  const previewImage = current?.imageData ?? signature?.imageData ?? null
  const nameError = nameTouched && !name.trim() ? "Escriba un nombre para identificar la firma." : null

  const changeMethod = (value: SignatureKind) => {
    if (value === "typed" && typedSeed === null) setTypedSeed(name)
    setMethod(value)
  }

  const handleSave = async () => {
    setNameTouched(true)
    if (!name.trim()) return
    if (!isEdit && !current) {
      toast.error("Primero cree la firma: dibújela, escríbala o suba una foto.")
      return
    }
    try {
      if (isEdit) {
        await updateSignature.mutateAsync({
          id: signature.id,
          data: { name: name.trim(), ...(current ? { kind: method, ...current } : {}) },
        })
        toast.success("Firma actualizada")
      } else {
        await createSignature.mutateAsync({ name: name.trim(), kind: method, ...current! })
        toast.success("Firma guardada en la biblioteca")
      }
      onDone()
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "No se pudo guardar la firma.")
    }
  }

  return (
    <div className={styles.studio}>
      <div className={styles.workArea}>
        <div className={styles.row}>
          <Segmented
            size="large"
            options={METHOD_OPTIONS}
            value={method}
            onChange={(v) => changeMethod(v as SignatureKind)}
          />
          {method !== "uploaded" && (
            <>
              <span className={styles.spacer} />
              <Segmented
                aria-label="Color de la tinta"
                options={(Object.keys(INK_COLORS) as InkKey[]).map((key) => ({
                  value: key,
                  label: INK_COLORS[key].label,
                }))}
                value={ink}
                onChange={(v) => setInk(v as InkKey)}
              />
            </>
          )}
        </div>

        {/* Los tres métodos quedan montados: cambiar de pestaña no borra lo que ya se hizo. */}
        <div hidden={method !== "drawn"}>
          <DrawPad color={INK_COLORS[ink].value} onChange={setDrawn} />
        </div>
        {typedSeed !== null && (
          <div hidden={method !== "typed"}>
            <TypePad color={INK_COLORS[ink].value} initialText={typedSeed} onChange={setTyped} />
          </div>
        )}
        <div hidden={method !== "uploaded"}>
          <UploadPad onChange={setUploaded} />
        </div>
      </div>

      <div className={styles.sideArea}>
        <div>
          <label className={styles.sectionLabel} htmlFor="signature-name">
            Nombre de la firma
          </label>
          <Input
            id="signature-name"
            value={name}
            maxLength={150}
            status={nameError ? "error" : undefined}
            placeholder="Ej.: Dra. Laura Gómez · Medicina interna"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
          />
          <p className={styles.helper} style={{ marginTop: 6, color: nameError ? "var(--ant-color-error, #d4380d)" : undefined }}>
            {nameError ?? "Así la encontrará al asignarla en el formulario de usuario."}
          </p>
        </div>

        <SignaturePreview imageData={previewImage} name={name} />

        {isEdit && !current && (
          <p className={styles.helper}>
            Se conserva la firma actual. Para reemplazarla, dibuje, escriba o suba una nueva. Los
            usuarios que ya la tienen asignada no cambian.
          </p>
        )}

        <p className={styles.tip}>{TIPS[method]}</p>
      </div>

      <div className={styles.footer}>
        <Button onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="primary" onClick={handleSave} loading={saving}>
          {isEdit ? "Guardar cambios" : "Guardar firma"}
        </Button>
      </div>
    </div>
  )
}
