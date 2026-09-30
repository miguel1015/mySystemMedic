"use client"

import { Checkbox, Tag } from "antd"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getNavIcon } from "@/components/Layout/Dashboard/Sidebar/navIcons"
import { TAccessModuleNode } from "@/core/interfaces/parameterization/accessControl"
import { groupState, menuViewKeys, moduleViewKeys, Selection, ViewKey } from "./permissionsState"

interface ModuleCardProps {
  module: TAccessModuleNode
  selection: Selection
  readOnly: boolean
  onToggle: (keys: ViewKey[], checked: boolean) => void
}

function ViewLabel({ name, icon }: { name: string; icon?: string | null }) {
  const definition = getNavIcon(icon)
  return (
    <span className="rp-view-label">
      {definition && <FontAwesomeIcon icon={definition} className="rp-view-icon" />}
      {name}
    </span>
  )
}

export default function ModuleCard({ module, selection, readOnly, onToggle }: ModuleCardProps) {
  const moduleState = groupState(moduleViewKeys(module), selection)

  return (
    <div className="rp-module-card">
      <div className="rp-module-header">
        <Checkbox
          checked={moduleState.checked}
          indeterminate={moduleState.indeterminate}
          disabled={readOnly}
          onChange={(e) => onToggle(moduleViewKeys(module), e.target.checked)}
        >
          {module.name}
        </Checkbox>
        <Tag color={moduleState.selected > 0 ? "green" : "default"}>
          {moduleState.selected}/{moduleState.total}
        </Tag>
      </div>

      <div className="rp-module-body">
        {module.menus.map((menu) => {
          const keys = menuViewKeys(menu)
          const menuState = groupState(keys, selection)

          return (
            <div key={menu.id} className="rp-menu">
              <Checkbox
                checked={menuState.checked}
                indeterminate={menuState.indeterminate}
                disabled={readOnly}
                onChange={(e) => onToggle(keys, e.target.checked)}
              >
                <ViewLabel name={menu.name} icon={menu.icon} />
              </Checkbox>

              {menu.subMenus.length === 0 && menu.route && (
                <span className="rp-view-route">{menu.route}</span>
              )}

              {menu.subMenus.length > 0 && (
                <div className="rp-submenus">
                  {menu.subMenus.map((subMenu) => {
                    const key: ViewKey = `s:${subMenu.id}`
                    return (
                      <Checkbox
                        key={subMenu.id}
                        checked={selection.has(key)}
                        disabled={readOnly}
                        onChange={(e) => onToggle([key], e.target.checked)}
                      >
                        <ViewLabel name={subMenu.name} icon={subMenu.icon} />
                      </Checkbox>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
