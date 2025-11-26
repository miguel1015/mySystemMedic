export interface TUsersContainer {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface TCreateUser {
  open?: boolean;
  setOpen: (open: boolean) => void;
}

export type DocumentType = {
  label: string;
  value: number;
};
