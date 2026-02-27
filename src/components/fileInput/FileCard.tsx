import React from "react"
import { Button, Progress, Typography, Space, Tooltip } from "antd"
import { Trash2, RefreshCw, Eye, FileText } from "lucide-react"
import { FileMeta } from "./types"
import { isImageSrc } from "./utils"

const { Text } = Typography

interface FileCardProps {
  fileMeta: FileMeta | null;
  hasFile: boolean;
  activePreview: string | null;
  borderColor: string;
  onPreview: () => void;
  onChangFile: () => void;
  onRemove: () => void;
}

export function FileCard({
  fileMeta,
  hasFile,
  activePreview,
  borderColor,
  onPreview,
  onChangFile,
  onRemove,
}: FileCardProps) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: `2px solid ${borderColor}`,
        background: "var(--bg-upload)",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {activePreview && isImageSrc(activePreview) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
            background: "#fafafa",
            borderBottom: `1px solid ${borderColor}`,
            minHeight: 80,
            maxHeight: 160,
          }}
        >
          <img
            src={activePreview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 140,
              objectFit: "contain",
              borderRadius: 4,
            }}
          />
        </div>
      )}

      {activePreview && !isImageSrc(activePreview) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            background: "#fafafa",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <FileText size={32} style={{ color: "#8c8c8c" }} />
        </div>
      )}

      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {fileMeta?.status === "uploading" ? (
          <Progress
            percent={fileMeta.progress}
            size="small"
            style={{ flex: 1, margin: 0 }}
          />
        ) : (
          <Text
            ellipsis
            style={{ color: "var(--accent-upload)", flex: 1, fontSize: 13 }}
          >
            {hasFile && fileMeta ? fileMeta.file.name : "Archivo actual"}
          </Text>
        )}

        <Space size={4}>
          {activePreview && (
            <Tooltip title="Ver archivo">
              <Button
                type="text"
                size="small"
                icon={<Eye size={15} />}
                onClick={onPreview}
              />
            </Tooltip>
          )}
          <Tooltip title="Cambiar archivo">
            <Button
              type="text"
              size="small"
              icon={<RefreshCw size={15} />}
              onClick={onChangFile}
            />
          </Tooltip>
          {hasFile && (
            <Tooltip title="Quitar archivo">
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 size={15} />}
                onClick={onRemove}
              />
            </Tooltip>
          )}
        </Space>
      </div>
    </div>
  )
}
