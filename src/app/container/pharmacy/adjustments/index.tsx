"use client"

import { useState } from "react"
import { Alert, Button, Input, InputNumber, Segmented, Select } from "antd"
import { ExportOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { useRegisterAdjustment, useRegisterExit } from "@/core/hooks/pharmacy/usePharmacy"
import type { Movement } from "@/core/interfaces/pharmacy/types"
import {
  OperationSuccess,
  PopupLayer,
  WarehouseSelect,
  useCurrentUserName,
  useWarehouseName,
} from "../shared/components"
import LotLines, { LotLine, lotLineError, newLotLine } from "../shared/LotLines"
import { fmtQty } from "../shared/format"
import styles from "../shared/pharmacy.module.scss"

type Mode = "exit" | "adjustment"

const EXIT_REASONS = [
  "Vencimiento",
  "Avería o daño",
  "Devolución al proveedor",
  "Consumo interno",
  "Pérdida o hurto",
  "Otro",
].map((r) => ({ value: r, label: r }))

export default function AdjustmentsContainer() {
  const userName = useCurrentUserName()
  const registerExit = useRegisterExit()
  const registerAdjustment = useRegisterAdjustment()
  const [mode, setMode] = useState<Mode>("exit")
  const [warehouseId, setWarehouseId] = useState<number | undefined>()
  const [lines, setLines] = useState<LotLine[]>([newLotLine()])
  const [exitReason, setExitReason] = useState<string | undefined>()
  const [reasonText, setReasonText] = useState("")
  const [correctsId, setCorrectsId] = useState<number | null>(null)
  const [observations, setObservations] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<Movement | null>(null)
  const warehouseName = useWarehouseName(warehouseId)
  const pending = registerExit.isPending || registerAdjustment.isPending

  const reason =
    mode === "exit"
      ? exitReason === "Otro"
        ? reasonText.trim()
        : [exitReason, reasonText.trim()].filter(Boolean).join(": ")
      : reasonText.trim()
  const reasonError =
    mode === "exit"
      ? !exitReason
        ? "Seleccione el motivo de la salida."
        : exitReason === "Otro" && !reasonText.trim()
          ? "Describa el motivo."
          : null
      : reasonText.trim().length < 10
        ? "La justificación debe tener al menos 10 caracteres."
        : null

  const valid = !!warehouseId && !reasonError && lines.length > 0 && lines.every((l) => !lotLineError(l, lines))

  const switchMode = (m: Mode) => {
    setMode(m)
    setLines([newLotLine()])
    setSubmitted(false)
    setReasonText("")
  }

  const reset = () => {
    setLines([newLotLine()])
    setExitReason(undefined)
    setReasonText("")
    setCorrectsId(null)
    setObservations("")
    setSubmitted(false)
    setResult(null)
  }

  const callbacks = {
    onSuccess: (m: Movement) => {
      toast.success(mode === "exit" ? "Salida registrada" : "Ajuste registrado")
      setResult(m)
    },
    onError: (e: Error) => toast.error(e.message, { duration: 7000 }),
  }

  const submit = () => {
    setSubmitted(true)
    if (!valid || !warehouseId) {
      toast.error("Revise los datos marcados.")
      return
    }
    const notes = observations.trim() || null
    if (mode === "exit") {
      registerExit.mutate(
        {
          warehouseId,
          reason,
          observations: notes,
          items: lines.map((l) => ({ lotId: l.lot!.lotId, quantity: l.quantity! })),
        },
        callbacks,
      )
    } else {
      registerAdjustment.mutate(
        {
          warehouseId,
          reason,
          correctsMovementId: correctsId,
          observations: notes,
          items: lines.map((l) => ({ lotId: l.lot!.lotId, direction: l.direction, quantity: l.quantity! })),
        },
        callbacks,
      )
    }
  }

  const plus = lines.filter((l) => l.direction === "Entrada").reduce((s, l) => s + (l.quantity ?? 0), 0)
  const minus = lines.filter((l) => l.direction === "Salida").reduce((s, l) => s + (l.quantity ?? 0), 0)

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<ExportOutlined />}
          title="Salidas y ajustes"
          subtitle="Bajas de inventario y correcciones justificadas. Los movimientos anteriores no se editan."
        />

        {result ? (
          <OperationSuccess
            movement={result}
            title={mode === "exit" ? "Salida registrada" : "Ajuste registrado"}
            onNew={reset}
            newLabel={mode === "exit" ? "Registrar otra salida" : "Registrar otro ajuste"}
          />
        ) : (
          <div className={styles.layout}>
            <div className={styles.stack}>
              <Segmented<Mode>
                block
                value={mode}
                onChange={switchMode}
                options={[
                  { value: "exit", label: "Salida (baja de inventario)" },
                  { value: "adjustment", label: "Ajuste de existencias" },
                ]}
              />

              <section className={styles.panel} aria-labelledby="adj-head">
                <div className={styles.panelHead}>
                  <span className={styles.step}>1</span>
                  <h2 id="adj-head" className={styles.panelTitle}>
                    {mode === "exit" ? "Bodega y motivo" : "Bodega y justificación"}
                  </h2>
                </div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label className={styles.required}>Bodega</label>
                    <WarehouseSelect
                      value={warehouseId}
                      onChange={(id) => {
                        setWarehouseId(id)
                        setLines([newLotLine()])
                      }}
                      status={submitted && !warehouseId ? "error" : undefined}
                    />
                  </div>
                  {mode === "exit" ? (
                    <div className={styles.field}>
                      <label className={styles.required}>Motivo</label>
                      <Select
                        value={exitReason}
                        onChange={setExitReason}
                        options={EXIT_REASONS}
                        placeholder="Seleccione el motivo"
                        status={submitted && !exitReason ? "error" : undefined}
                        aria-label="Motivo de la salida"
                      />
                    </div>
                  ) : (
                    <div className={styles.field}>
                      <label>Corrige el movimiento N.º</label>
                      <InputNumber
                        min={1}
                        precision={0}
                        value={correctsId}
                        onChange={(v) => setCorrectsId(v)}
                        placeholder="Opcional · p. ej. 125"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label className={mode === "adjustment" || exitReason === "Otro" ? styles.required : undefined}>
                      {mode === "exit" ? "Detalle del motivo" : "Justificación"}
                    </label>
                    <Input.TextArea
                      rows={2}
                      maxLength={mode === "exit" ? 300 : 500}
                      showCount
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      status={
                        submitted && reasonError && (mode === "adjustment" || exitReason === "Otro")
                          ? "error"
                          : undefined
                      }
                      placeholder={
                        mode === "exit"
                          ? "Opcional salvo en «Otro» · p. ej. frasco roto al recibir"
                          : "Explique por qué se corrige la existencia (conteo físico, error de digitación…)"
                      }
                    />
                  </div>
                </div>
                {submitted && reasonError && <p className={styles.lineError}>{reasonError}</p>}
              </section>

              <section className={styles.panel} aria-labelledby="adj-lines">
                <div className={styles.panelHead}>
                  <span className={styles.step}>2</span>
                  <h2 id="adj-lines" className={styles.panelTitle}>
                    Lotes
                  </h2>
                  {mode === "adjustment" && (
                    <p className={styles.panelHint}>«Suma» permite usar cualquier lote ya registrado del producto</p>
                  )}
                </div>
                <LotLines
                  key={mode}
                  lines={lines}
                  onChange={setLines}
                  warehouseId={warehouseId}
                  withDirection={mode === "adjustment"}
                  submitted={submitted}
                />
              </section>

              <section className={styles.panel}>
                <div className={styles.field}>
                  <label htmlFor="adj-notes">Observaciones</label>
                  <Input.TextArea
                    id="adj-notes"
                    rows={2}
                    maxLength={2000}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </section>
            </div>

            <aside className={`${styles.panel} ${styles.summary}`} aria-label="Resumen">
              <h2 className={styles.panelTitle} style={{ marginBottom: 14 }}>
                Resumen
              </h2>
              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Operación</dt>
                  <dd>{mode === "exit" ? "Salida" : "Ajuste"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Bodega</dt>
                  <dd>{warehouseName ?? "—"}</dd>
                </div>
                {mode === "adjustment" && plus > 0 && (
                  <div className={styles.summaryRow}>
                    <dt>Suma</dt>
                    <dd className={styles.qtyIn}>+{fmtQty(plus)}</dd>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <dt>Resta</dt>
                  <dd className={styles.qtyOut}>−{fmtQty(minus)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Responsable</dt>
                  <dd>{userName}</dd>
                </div>
              </dl>
              {submitted && !valid && (
                <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Hay datos por corregir." />
              )}
              <Button type="primary" danger={mode === "exit"} block size="large" loading={pending} onClick={submit}>
                {mode === "exit" ? "Registrar salida" : "Registrar ajuste"}
              </Button>
            </aside>
          </div>
        )}
      </Container>
    </PopupLayer>
  )
}
