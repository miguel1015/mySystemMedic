"use client"

import { ExclamationCircleOutlined } from "@ant-design/icons"
import { Col, Collapse, Row, Space, Tag } from "antd"
import { useMemo } from "react"
import type { RipsMissingField } from "./buildRips"

const monoStyle: React.CSSProperties = { fontFamily: "monospace" }

export function countRipsIssues(missing: RipsMissingField[]) {
  const errors = missing.filter((item) => item.severity === "error").length
  return { errors, warnings: missing.length - errors }
}

interface RipsIssuesPanelProps {
  missing: RipsMissingField[]
  style?: React.CSSProperties
}

// Errores (el MUV rechazaría el RIPS) y avisos agrupados por sección, desplegables.
export function RipsIssuesPanel({ missing, style }: RipsIssuesPanelProps) {
  const missingByGroup = useMemo(() => {
    const groups = new Map<string, RipsMissingField[]>()
    for (const item of missing) {
      const list = groups.get(item.group) ?? []
      list.push(item)
      groups.set(item.group, list)
    }
    return Array.from(groups.entries())
  }, [missing])

  if (missing.length === 0) return null

  const { errors: errorCount, warnings: warningCount } = countRipsIssues(missing)

  return (
    <Collapse
      style={style}
      items={[
        {
          key: "missing",
          label: (
            <Space wrap>
              <ExclamationCircleOutlined style={{ color: errorCount > 0 ? "#dc2626" : "#d97706" }} />
              <span>
                {errorCount > 0
                  ? `${errorCount} errores que el MUV rechazaría`
                  : "Sin errores de rechazo detectados"}
                {warningCount > 0 && ` · ${warningCount} avisos`}
              </span>
            </Space>
          ),
          children: (
            <Row gutter={[24, 16]}>
              {missingByGroup.map(([group, items]) => (
                <Col key={group} xs={24} md={12} xl={8}>
                  <strong>{group}</strong>
                  <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                    {items.map((item) => (
                      <li key={`${item.field}-${item.reason}`}>
                        <Tag
                          color={item.severity === "error" ? "error" : "warning"}
                          style={{ marginInlineEnd: 6 }}
                        >
                          {item.severity === "error" ? "Error" : "Aviso"}
                        </Tag>
                        <span style={monoStyle}>{item.field}</span>: {item.reason}
                      </li>
                    ))}
                  </ul>
                </Col>
              ))}
            </Row>
          ),
        },
      ]}
    />
  )
}
