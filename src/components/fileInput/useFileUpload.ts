import { useRef, useState, useCallback, useEffect } from "react"
import { useController, FieldValues } from "react-hook-form"
import { FileMeta, FileUploadProps } from "./types"
import { generateId } from "./utils"

export function useFileUpload<T extends FieldValues>({
  name,
  control,
  accept,
  disabled = false,
  uploadUrl,
  uploadHeaders,
  onUploadComplete,
  maxFileSize = 5 * 1024 * 1024,
  initialPreview,
}: Pick<
  FileUploadProps<T>,
  | "name"
  | "control"
  | "accept"
  | "disabled"
  | "uploadUrl"
  | "uploadHeaders"
  | "onUploadComplete"
  | "maxFileSize"
  | "initialPreview"
>) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null)
  const [showModal, setShowModal] = useState(false)

  const {
    field: { onChange },
    fieldState: { error },
  } = useController({ name, control })

  const revokePreview = useCallback((meta: FileMeta | null) => {
    if (meta?.preview) URL.revokeObjectURL(meta.preview)
  }, [])

  const matchesAccept = (file: File) => {
    if (!accept) return true
    const tokens = accept.split(",").map((t) => t.trim().toLowerCase())
    return tokens.some((token) => {
      if (token.endsWith("/*")) {
        return file.type.startsWith(token.replace("/*", "/"))
      }
      if (token.startsWith(".")) {
        return file.name.toLowerCase().endsWith(token)
      }
      return file.type === token
    })
  }

  const validateBeforeAdd = (f: File) => {
    if (!matchesAccept(f)) {
      return "Tipo de archivo no permitido"
    }
    if (f.size > maxFileSize) {
      return `Archivo demasiado grande (máx ${Math.round(maxFileSize / 1024 / 1024)} MB)`
    }
    return null
  }

  const uploadSingle = async (meta: FileMeta) => {
    if (!uploadUrl) return

    const err = validateBeforeAdd(meta.file)
    if (err) {
      setFileMeta({ ...meta, status: "error", error: err })
      return
    }

    setFileMeta({ ...meta, status: "uploading", progress: 0 })

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      const fd = new FormData()
      fd.append("file", meta.file)

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pr = Math.round((ev.loaded / ev.total) * 100)
          setFileMeta((prev) => (prev ? { ...prev, progress: pr } : prev))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFileMeta((prev) =>
            prev ? { ...prev, progress: 100, status: "done" } : prev
          )
          let json: unknown = null
          try {
            json = JSON.parse(xhr.responseText)
          } catch {
            json = xhr.responseText
          }
          onUploadComplete?.(meta.file, json)
        } else {
          setFileMeta({ ...meta, status: "error", error: `HTTP ${xhr.status}` })
        }
        resolve()
      }

      xhr.onerror = () => {
        setFileMeta({ ...meta, status: "error", error: "Network error" })
        resolve()
      }

      xhr.open("POST", uploadUrl, true)
      if (uploadHeaders) {
        Object.entries(uploadHeaders).forEach(([k, v]) =>
          xhr.setRequestHeader(k, v)
        )
      }
      xhr.send(fd)
    })
  }

  const addFile = (incoming: FileList | null) => {
    if (!incoming) return
    const file = incoming[0]
    if (!file) return

    const err = validateBeforeAdd(file)
    if (err) {
      setFileMeta({
        id: generateId(),
        file,
        preview: undefined,
        progress: 0,
        status: "error",
        error: err,
      })
      return
    }

    const isImage = file.type.startsWith("image/")
    revokePreview(fileMeta)

    const meta: FileMeta = {
      id: generateId(),
      file,
      preview: isImage ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: "idle",
    }

    setFileMeta(meta)
    onChange(file)
    if (uploadUrl) uploadSingle(meta)
  }

  const removeFile = () => {
    revokePreview(fileMeta)
    setFileMeta(null)
    onChange(undefined)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateBeforeAdd(file)
    if (err) {
      setFileMeta({
        id: generateId(),
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: "error",
        error: err,
      })
      return
    }

    addFile(e.target.files!)
    if (inputRef.current) inputRef.current.value = ""
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) addFile(e.dataTransfer.files)
  }

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  useEffect(() => {
    return () => revokePreview(fileMeta)
  }, [])

  const hasError = !!error
  const borderColor = hasError ? "#ff4d4f" : "#d9d9d9"
  const currentPreview = fileMeta?.preview ?? null
  const existingPreview = !fileMeta && initialPreview ? initialPreview : null
  const activePreview = currentPreview || existingPreview
  const hasFile = !!fileMeta
  const hasExisting = !!existingPreview
  const showDropZone = !hasFile && !hasExisting

  return {
    inputRef,
    fileMeta,
    showModal,
    setShowModal,
    error,
    hasError,
    borderColor,
    activePreview,
    hasFile,
    hasExisting,
    showDropZone,
    currentPreview,
    existingPreview,
    handleInputChange,
    onDragOver,
    onDrop,
    openFilePicker,
    removeFile,
  }
}
