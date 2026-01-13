export interface TUtils {
  open?: boolean;
  editUserId?: number | null;
  setOpen: (open: boolean) => void;
  setEditUserId: (id: number | null) => void;
}
