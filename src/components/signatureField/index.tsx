"use client"

import { useMemo, useRef, useState } from "react"
import { Control, FieldValues, Path, useController } from "react-hook-form"
import { Button, Input } from "antd"
import {
  CheckCircleFilled,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
  SignatureOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import clsx from "clsx"
import toast from "react-hot-toast"
import { useSignatures } from "@/core/hooks/parameterization/signatures/useSignatures"
import { cleanSignatureImage, loadImage } from "@/core/utils/signatureImage"
import styles from "./signatureField.module.scss"

interface Props<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
}

const ACCEPT = "image/png,image/jpeg,image/webp"
const MAX_FILE_SIZE = 10 * 1024 * 1024
const STUDIO_ROUTE = "/parameterization/signatures"

/**
 * Firma del usuario: se elige de la biblioteca (Parametrización > Firmas) o se sube una
 * imagen. En ambos casos el valor es la imagen (data URL), que se copia al usuario: si
 * luego la firma de la biblioteca cambia, la del usuario no.
 */
export default function SignatureField<T extends FieldValues>({ name, control, label = "Firma" }: Props<T>) {
  const { field } = useController({ name, control })
  const value: string | null = typeof field.value === "string" && field.value ? field.value : null

  const [libraryOpen, setLibraryOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [source, setSource] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, isFetching, refetch } = useSignatures(libraryOpen)
  const signatures = data ?? []
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es")
    return term ? signatures.filter((s) => s.name.toLocaleLowerCase("es").includes(term)) : signatures
  }, [signatures, search])

  const selectedId = signatures.find((s) => s.imageData === value)?.id ?? null

  const handleFile = async (file?: File | null) => {
    if (!file) return
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("La firma debe ser una imagen PNG, JPG o WEBP.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("La imagen pesa más de 10 MB.")
      return
    }
    setUploading(true)
    try {
      const img = await loadImage(file)
      // Se quita el fondo para que la firma no tape el texto del documento.
      const cleaned = cleanSignatureImage(img, { sensitivity: 0.5, ink: "original" })
      if (!cleaned) {
        toast.error("No se encontró ningún trazo en la imagen. Pruebe con otra foto.")
        return
      }
      field.onChange(cleaned.imageData)
      setSource("Imagen subida · fondo quitado automáticamente")
      setLibraryOpen(false)
    } catch {
      toast.error("No se pudo abrir la imagen.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      <div className={styles.field}>
        <div className={clsx(styles.paper, !value && styles.paperEmpty)}>
          {value ? (
            <img src={value} alt="Firma asignada al usuario" />
          ) : (
            <span className={styles.paperHint}>Sin firma asignada</span>
          )}
        </div>
        <div className={styles.side}>
          {source && value && <p className={styles.source}>{source}</p>}
          <div className={styles.actions}>
            <Button
              type={libraryOpen ? "primary" : "default"}
              icon={<SignatureOutlined />}
              onClick={() => setLibraryOpen((o) => !o)}
              aria-expanded={libraryOpen}
            >
              {libraryOpen ? "Cerrar biblioteca" : "Elegir de la biblioteca"}
            </Button>
            <Button icon={<UploadOutlined />} loading={uploading} onClick={() => inputRef.current?.click()}>
              Subir imagen
            </Button>
            {value && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  field.onChange("")
                  setSource(null)
                }}
              >
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>

      {libraryOpen && (
        <div className={styles.library}>
          <div className={styles.libraryBar}>
            <Input
              className={styles.search}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Buscar firma"
              aria-label="Buscar firma en la biblioteca"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="text"
              icon={<ReloadOutlined spin={isFetching && !isLoading} />}
              onClick={() => refetch()}
              aria-label="Actualizar la biblioteca"
            />
            <a className={styles.studioLink} href={STUDIO_ROUTE} target="_blank" rel="noreferrer">
              Crear una firma nueva <ExportOutlined aria-hidden />
            </a>
          </div>

          {isLoading ? (
            <div className={styles.grid} aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : isError ? (
            <p className={styles.message} role="alert">
              No se pudo cargar la biblioteca de firmas.{" "}
              <Button type="link" size="small" onClick={() => refetch()}>
                Reintentar
              </Button>
            </p>
          ) : signatures.length === 0 ? (
            <p className={styles.message}>
              La biblioteca está vacía. Cree una firma en{" "}
              <a href={STUDIO_ROUTE} target="_blank" rel="noreferrer">
                Parametrización › Firmas
              </a>{" "}
              y vuelva aquí: la lista se actualiza sola.
            </p>
          ) : filtered.length === 0 ? (
            <p className={styles.message}>Ninguna firma coincide con «{search.trim()}».</p>
          ) : (
            <div className={styles.grid} role="listbox" aria-label="Firmas de la biblioteca">
              {filtered.map((s) => {
                const selected = s.id === selectedId
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={clsx(styles.option, selected && styles.optionSelected)}
                    onClick={() => {
                      field.onChange(s.imageData)
                      setSource(`De la biblioteca: ${s.name}`)
                      setLibraryOpen(false)
                    }}
                  >
                    <span className={styles.optionPaper}>
                      <img src={s.imageData} alt="" />
                    </span>
                    <span className={styles.optionName} title={s.name}>
                      {s.name}
                    </span>
                    {selected && <CheckCircleFilled className={styles.optionCheck} aria-hidden />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
