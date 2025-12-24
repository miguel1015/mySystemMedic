export interface BackendSubMenu {
  id: number;
  name: string;
  route: string;
  sortOrder: number;
}

export interface BackendMenu {
  id: number;
  name: string;
  route: string;
  icon?: string;
  sortOrder: number;
  subMenus: BackendSubMenu[];
}

export interface BackendModule {
  id: number;
  name: string;
  sortOrder: number;
  menus: BackendMenu[];
}

export interface MenuResponse {
  modules: BackendModule[];
}
