import React from "react"
import { Typography, Space } from "antd"
import { Upload } from "lucide-react"

const { Text } = Typography

interface DropZoneProps {
  hasError: boolean;
  borderColor: string;
  disabled: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function DropZone({
  hasError,
  borderColor,
  disabled,
  onClick,
  onDragOver,
  onDrop,
}: DropZoneProps) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        borderRadius: 8,
        padding: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        height: 45,
        background: hasError ? "rgba(255,0,0,0.06)" : "var(--bg-upload)",
        border: `2px dashed ${borderColor}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "border-color 0.2s, background 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Space size={10}>
        <Upload size={16} style={{ color: "var(--accent-upload)" }} />
        <Text strong style={{ color: "var(--accent-upload)", fontSize: 13 }}>
          Arrastra o haz clic para subir archivo
        </Text>
      </Space>
    </div>
  )
}
