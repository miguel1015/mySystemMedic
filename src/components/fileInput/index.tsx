"use client"

import React from "react"
import { FieldValues } from "react-hook-form"
import { Typography } from "antd"
import { FileUploadProps } from "./types"
import { useFileUpload } from "./useFileUpload"
import { DropZone } from "./DropZone"
import { FileCard } from "./FileCard"
import { PreviewModal } from "./PreviewModal"

const { Text } = Typography
export type { FileUploadProps } from "./types"

export default function FileUploadInput<T extends FieldValues>({
  name,
  control,
  label,
  accept = ".pdf, image/*, .doc, .docx, .xls, .xlsx",
  disabled = false,
  uploadUrl,
  uploadHeaders,
  onUploadComplete,
  maxFileSize = 5 * 1024 * 1024,
  initialPreview,
}: FileUploadProps<T>) {
  const {
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
  } = useFileUpload({
    name,
    control,
    accept,
    disabled,
    uploadUrl,
    uploadHeaders,
    onUploadComplete,
    maxFileSize,
    initialPreview,
  })

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <Text strong style={{ display: "block", marginBottom: 6 }}>
          {label}
        </Text>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {showDropZone && (
        <DropZone
          hasError={hasError}
          borderColor={borderColor}
          disabled={disabled}
          onClick={openFilePicker}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      )}

      {(hasFile || hasExisting) && (
        <FileCard
          fileMeta={fileMeta}
          hasFile={hasFile}
          activePreview={activePreview}
          borderColor={borderColor}
          onPreview={() => setShowModal(true)}
          onChangFile={openFilePicker}
          onRemove={removeFile}
        />
      )}

      {fileMeta?.status === "error" && fileMeta.error && (
        <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
          {fileMeta.error}
        </Text>
      )}

      {hasError && (
        <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
          {error?.message}
        </Text>
      )}

      <PreviewModal
        open={showModal}
        previewSrc={currentPreview || existingPreview}
        fileMeta={fileMeta}
        hasFile={hasFile}
        initialPreview={initialPreview}
        onClose={() => setShowModal(false)}
        onRemove={removeFile}
      />
    </div>
  )
}
