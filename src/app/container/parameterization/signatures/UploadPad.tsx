"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Segmented, Slider } from "antd"
import { PictureOutlined, SwapOutlined } from "@ant-design/icons"
import clsx from "clsx"
import {
  INK_COLORS,
  cleanSignatureImage,
  loadImage,
  type ExportedSignature,
  type UploadInk,
} from "@/core/utils/signatureImage"
import styles from "./signatures.module.scss"

interface Props {
  onChange: (result: ExportedSignature | null) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPT = "image/png,image/jpeg,image/webp"

const INK_OPTIONS: { label: string; value: UploadInk }[] = [
  { label: INK_COLORS.black.label, value: "black" },
  { label: INK_COLORS.blue.label, value: "blue" },
  { label: "Colores originales", value: "original" },
]

/** Sube la foto o el escaneo de una firma en papel y le quita el fondo. */
export default function UploadPad({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [result, setResult] = useState<ExportedSignature | null>(null)
  const [sensitivity, setSensitivity] = useState(0.5)
  const [ink, setInk] = useState<UploadInk>("black")
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!image) return
    const timer = setTimeout(() => {
      const cleaned = cleanSignatureImage(image, { sensitivity, ink })
      setResult(cleaned)
      onChange(cleaned)
      setError(cleaned ? null : "No se encontró ningún trazo. Suba la sensibilidad o pruebe con otra foto.")
    }, 120)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, sensitivity, ink])

  useEffect(
    () => () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl)
    },
    [originalUrl],
  )

  const handleFile = async (file?: File | null) => {
    if (!file) return
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("El archivo debe ser una imagen PNG, JPG o WEBP.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen pesa más de 10 MB. Tome la foto con menos resolución o recórtela.")
      return
    }
    try {
      const img = await loadImage(file)
      setError(null)
      setOriginalUrl(URL.createObjectURL(file))
      setImage(img)
    } catch {
      setError("No se pudo abrir la imagen. Pruebe con otro archivo.")
    }
  }

  const reset = () => {
    setImage(null)
    setResult(null)
    setOriginalUrl(null)
    onChange(null)
    inputRef.current?.click()
  }

  return (
    <div className={styles.workArea}>
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

      {!image ? (
        <button
          type="button"
          className={clsx(styles.drop, dragging && styles.dropActive)}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <PictureOutlined className={styles.dropIcon} aria-hidden />
          <span className={styles.dropTitle}>Arrastre la foto de la firma o haga clic para elegirla</span>
          <span className={styles.dropHint}>
            Firme en una hoja blanca con bolígrafo oscuro y tómele una foto con buena luz. El fondo se
            quita automáticamente.
          </span>
        </button>
      ) : (
        <>
          <div className={styles.compare}>
            <div className={styles.compareCell}>
              <div className={clsx(styles.compareFrame, styles.compareOriginal)}>
                {originalUrl && <img src={originalUrl} alt="Imagen original" />}
              </div>
              <span className={styles.compareCaption}>Imagen original</span>
            </div>
            <div className={styles.compareCell}>
              <div className={clsx(styles.compareFrame, styles.compareResult)}>
                {result && <img src={result.imageData} alt="Firma sin fondo" />}
              </div>
              <span className={styles.compareCaption}>Sin fondo (los cuadros son la transparencia)</span>
            </div>
          </div>

          <div>
            <label className={styles.sectionLabel} htmlFor="signature-sensitivity">
              Limpieza del fondo
            </label>
            <Slider
              id="signature-sensitivity"
              min={0}
              max={1}
              step={0.05}
              value={sensitivity}
              onChange={setSensitivity}
              tooltip={{ formatter: null }}
            />
            <div className={styles.sliderLabels} aria-hidden>
              <span>Quitar más fondo</span>
              <span>Conservar trazos claros</span>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.sectionLabel} style={{ margin: 0 }}>
              Color de la tinta
            </span>
            <Segmented
              options={INK_OPTIONS}
              value={ink}
              onChange={(v) => setInk(v as UploadInk)}
            />
            <span className={styles.spacer} />
            <Button icon={<SwapOutlined />} onClick={reset}>
              Cambiar imagen
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className={styles.helper} role="alert" style={{ color: "var(--ant-color-error, #d4380d)" }}>
          {error}
        </p>
      )}
    </div>
  )
}
