import { Control, FieldValues, Path } from "react-hook-form"

export type FileMeta = {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
}

export interface FileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  accept?: string;
  disabled?: boolean;
  uploadUrl?: string;
  uploadHeaders?: Record<string, string>;
  onUploadComplete?: (file: File, response: unknown) => void;
  maxFileSize?: number;
  initialPreview?: string;
}
