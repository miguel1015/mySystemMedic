"use client";

import React, { useRef, useState, useCallback } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

type FileMeta = {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
};

export interface FileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  accept?: string;
  className?: string;
  disabled?: boolean;
  uploadUrl?: string;
  uploadHeaders?: Record<string, string>;
  onUploadComplete?: (file: File, response: any) => void;
  maxFiles?: number;
  maxFileSize?: number;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function FileUploadInput<T extends FieldValues>({
  name,
  control,
  label,
  accept = ".pdf, image/*, .doc, .docx, .xls, .xlsx",
  className,
  disabled = false,
  uploadUrl,
  uploadHeaders,
  onUploadComplete,
  maxFileSize = 5 * 1024 * 1024,
}: FileUploadProps<T>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    field: { onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const revokePreview = useCallback((meta: FileMeta | null) => {
    if (meta?.preview) URL.revokeObjectURL(meta.preview);
  }, []);

  const validateBeforeAdd = (f: File) => {
    if (f.size > maxFileSize) {
      return `Archivo demasiado grande (máx ${Math.round(
        maxFileSize / 1024 / 1024
      )} MB)`;
    }
    return null;
  };

  const addFile = (incoming: FileList | null) => {
    if (!incoming) return;

    const file = incoming[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");

    revokePreview(fileMeta);

    const meta: FileMeta = {
      id: generateId(),
      file,
      preview: isImage ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: "idle",
    };

    setFileMeta(meta);
    onChange(file);

    if (uploadUrl) uploadSingle(meta);
  };

  const removeFile = () => {
    revokePreview(fileMeta);
    setFileMeta(null);
    onChange(undefined);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) addFile(e.dataTransfer.files);
  };

  const uploadSingle = async (meta: FileMeta) => {
    if (!uploadUrl) return;

    const err = validateBeforeAdd(meta.file);
    if (err) {
      setFileMeta({ ...meta, status: "error", error: err });
      return;
    }

    setFileMeta({ ...meta, status: "uploading", progress: 0 });

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("file", meta.file);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pr = Math.round((ev.loaded / ev.total) * 100);
          setFileMeta((prev) => (prev ? { ...prev, progress: pr } : prev));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFileMeta((prev) =>
            prev ? { ...prev, progress: 100, status: "done" } : prev
          );

          let json: any = null;
          try {
            json = JSON.parse(xhr.responseText);
          } catch {
            json = xhr.responseText;
          }

          onUploadComplete?.(meta.file, json);
        } else {
          setFileMeta({
            ...meta,
            status: "error",
            error: `HTTP ${xhr.status}`,
          });
        }
        resolve();
      };

      xhr.onerror = () => {
        setFileMeta({ ...meta, status: "error", error: "Network error" });
        resolve();
      };

      xhr.open("POST", uploadUrl, true);
      if (uploadHeaders) {
        Object.entries(uploadHeaders).forEach(([k, v]) =>
          xhr.setRequestHeader(k, v)
        );
      }
      xhr.send(fd);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateBeforeAdd(file);
    if (err) {
      setFileMeta({
        id: generateId(),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        progress: 0,
        status: "error",
        error: err,
      });
      return;
    }

    addFile(e.target.files!);
    if (inputRef.current) inputRef.current.value = "";
  };

  React.useEffect(() => {
    return () => revokePreview(fileMeta);
  }, []);

  return (
    <div className="mb-3">
      {label && <label className="form-label fw-semibold">{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {/* 🔥 SIN ARCHIVO */}
      {!fileMeta && (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={classNames("w-100", className)}
          style={{
            borderRadius: 8,
            padding: 8,
            cursor: disabled ? "not-allowed" : "pointer",
            height: 45,
            background: error ? "rgba(255,0,0,0.12)" : "var(--bg-upload)",
            border: error ? "2px solid #ff4d4f" : "2px solid #495057",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            transition: "0.25s",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <FontAwesomeIcon
              icon={faUpload}
              style={{ color: "var(--accent-upload)" }}
            />
            <span
              className="fw-semibold"
              style={{ color: "var(--accent-upload)" }}
            >
              Arrastra o haz clic para subir archivo
            </span>
          </div>
        </div>
      )}

      {/* 🔥 CON ARCHIVO */}
      {fileMeta && (
        <div
          className="d-flex align-items-center justify-content-between"
          style={{
            borderRadius: 8,
            padding: "8px 12px",
            height: 40,
            background: "var(--bg-upload)",
            border: error ? "2px solid #ff4d4f" : "2px solid #495057",
            transition: "0.25s",
          }}
        >
          <div
            style={{
              color: "var(--accent-upload)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "90%",
              textAlign: "center",
            }}
          >
            {fileMeta.file.name}
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--accent-upload)",
            }}
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div>
      )}

      {/* 🔥 MODAL CON ANIMACIÓN */}
      {showModal && fileMeta && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            color: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 9999,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 20,
              width: 400,
              maxWidth: "100%",
              animation: "scaleIn 0.25s ease-out",
            }}
          >
            <h6>Archivo cargado</h6>

            {fileMeta.preview ? (
              <img
                src={fileMeta.preview}
                alt={fileMeta.file.name}
                style={{ width: "100%", borderRadius: 6 }}
              />
            ) : (
              <p>{fileMeta.file.name}</p>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-sm btn-outline-danger me-2"
                onClick={() => {
                  removeFile();
                  setShowModal(false);
                }}
              >
                Quitar
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="invalid-feedback d-block mt-2">{error.message}</div>
      )}

      {/* 🔥 ANIMACIONES CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
