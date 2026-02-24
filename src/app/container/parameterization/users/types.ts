export interface TUsersContainer {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface TCreateUser {
  open?: boolean;
  editUserId: number | null;
  setOpen: (open: boolean) => void;
  setEditUserId: (id: number | null) => void;
}

export type DocumentType = {
  label: string;
  value: number;
};
