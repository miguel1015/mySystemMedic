import {
  TAccessMenuNode,
  TAccessModuleNode,
  TRolePermissions,
  TUpdateRolePermissions,
} from "@/core/interfaces/parameterization/accessControl"

// Una "vista" es lo que realmente se permite: un submenú, o un menú que no tiene submenús.
// Se identifica con una clave "s:<id>" o "m:<id>" para manejar ambas en un mismo Set.
export type ViewKey = `m:${number}` | `s:${number}`
export type Selection = ReadonlySet<ViewKey>

export const menuViewKeys = (menu: TAccessMenuNode): ViewKey[] =>
  menu.subMenus.length > 0
    ? menu.subMenus.map((sm) => `s:${sm.id}` as const)
    : [`m:${menu.id}` as const]

export const moduleViewKeys = (module: TAccessModuleNode): ViewKey[] =>
  module.menus.flatMap(menuViewKeys)

export const treeViewKeys = (tree: TAccessModuleNode[]): ViewKey[] => tree.flatMap(moduleViewKeys)

export function selectionFromPermissions(permissions: TRolePermissions): Selection {
  return new Set<ViewKey>([
    ...permissions.menuIds.map((id) => `m:${id}` as const),
    ...permissions.subMenuIds.map((id) => `s:${id}` as const),
  ])
}

export function selectionToRequest(selection: Selection): TUpdateRolePermissions {
  const menuIds: number[] = []
  const subMenuIds: number[] = []

  selection.forEach((key) => {
    const id = Number(key.slice(2))
    if (key.startsWith("m:")) menuIds.push(id)
    else subMenuIds.push(id)
  })

  return { menuIds, subMenuIds }
}

// Estado de un grupo de vistas (módulo o menú) para su casilla: marcada, parcial o vacía.
export function groupState(keys: ViewKey[], selection: Selection) {
  const selected = keys.filter((key) => selection.has(key)).length
  return {
    selected,
    total: keys.length,
    checked: keys.length > 0 && selected === keys.length,
    indeterminate: selected > 0 && selected < keys.length,
  }
}

export function toggleKeys(selection: Selection, keys: ViewKey[], checked: boolean): Selection {
  const next = new Set(selection)
  keys.forEach((key) => (checked ? next.add(key) : next.delete(key)))
  return next
}

export function sameSelection(a: Selection, b: Selection) {
  if (a.size !== b.size) return false
  for (const key of a) if (!b.has(key)) return false
  return true
}

// Filtra el árbol por texto: un menú queda si coincide él o alguno de sus submenús.
export function filterTree(tree: TAccessModuleNode[], search: string): TAccessModuleNode[] {
  const term = normalizeText(search)
  if (!term) return tree

  return tree
    .map((module) => {
      if (normalizeText(module.name).includes(term)) return module

      const menus = module.menus
        .map((menu) => {
          if (normalizeText(menu.name).includes(term)) return menu
          const subMenus = menu.subMenus.filter((sm) => normalizeText(sm.name).includes(term))
          return subMenus.length > 0 ? { ...menu, subMenus } : null
        })
        .filter((menu): menu is TAccessMenuNode => menu !== null)

      return menus.length > 0 ? { ...module, menus } : null
    })
    .filter((module): module is TAccessModuleNode => module !== null)
}

export const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
