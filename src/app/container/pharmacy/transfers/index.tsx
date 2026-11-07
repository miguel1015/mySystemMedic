"use client"

import { useState } from "react"
import { Alert, Button, Input } from "antd"
import { ArrowRightOutlined, SwapOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { useRegisterTransfer } from "@/core/hooks/pharmacy/usePharmacy"
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

export default function TransfersContainer() {
  const userName = useCurrentUserName()
  const register = useRegisterTransfer()
  const [sourceId, setSourceId] = useState<number | undefined>()
  const [destinationId, setDestinationId] = useState<number | undefined>()
  const [lines, setLines] = useState<LotLine[]>([newLotLine()])
  const [observations, setObservations] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<Movement | null>(null)
  const sourceName = useWarehouseName(sourceId)
  const destinationName = useWarehouseName(destinationId)

  const sameWarehouse = !!sourceId && sourceId === destinationId
  const valid =
    !!sourceId && !!destinationId && !sameWarehouse && lines.length > 0 && lines.every((l) => !lotLineError(l, lines))

  const changeSource = (id: number | undefined) => {
    setSourceId(id)
    // Los lotes elegidos eran de la bodega anterior.
    setLines([newLotLine()])
    if (id && id === destinationId) setDestinationId(undefined)
  }

  const reset = () => {
    setLines([newLotLine()])
    setObservations("")
    setSubmitted(false)
    setResult(null)
  }

  const submit = () => {
    setSubmitted(true)
    if (!valid || !sourceId || !destinationId) {
      toast.error("Revise los datos marcados antes de trasladar.")
      return
    }
    register.mutate(
      {
        sourceWarehouseId: sourceId,
        destinationWarehouseId: destinationId,
        observations: observations.trim() || null,
        items: lines.map((l) => ({ lotId: l.lot!.lotId, quantity: l.quantity! })),
      },
      {
        onSuccess: (m) => {
          toast.success("Traslado registrado")
          setResult(m)
        },
        onError: (e: Error) => toast.error(e.message, { duration: 7000 }),
      },
    )
  }

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<SwapOutlined />}
          title="Traslado entre bodegas"
          subtitle="El lote conserva su número y vencimiento en la bodega de destino"
        />

        {result ? (
          <OperationSuccess movement={result} title="Traslado registrado" onNew={reset} newLabel="Nuevo traslado" />
        ) : (
          <div className={styles.layout}>
            <div className={styles.stack}>
              <section className={styles.panel} aria-labelledby="tr-wh">
                <div className={styles.panelHead}>
                  <span className={styles.step}>1</span>
                  <h2 id="tr-wh" className={styles.panelTitle}>
                    Bodegas
                  </h2>
                </div>
                <div className={styles.grid} style={{ alignItems: "end" }}>
                  <div className={styles.field}>
                    <label className={styles.required}>Bodega de origen</label>
                    <WarehouseSelect
                      value={sourceId}
                      onChange={changeSource}
                      status={submitted && !sourceId ? "error" : undefined}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.required}>
                      <ArrowRightOutlined aria-hidden /> Bodega de destino
                    </label>
                    <WarehouseSelect
                      value={destinationId}
                      onChange={setDestinationId}
                      exclude={sourceId}
                      status={submitted && (!destinationId || sameWarehouse) ? "error" : undefined}
                    />
                  </div>
                </div>
                {sameWarehouse && (
                  <p className={styles.lineError}>La bodega de destino debe ser distinta a la de origen.</p>
                )}
              </section>

              <section className={styles.panel} aria-labelledby="tr-lines">
                <div className={styles.panelHead}>
                  <span className={styles.step}>2</span>
                  <h2 id="tr-lines" className={styles.panelTitle}>
                    Lotes a trasladar
                  </h2>
                </div>
                <LotLines lines={lines} onChange={setLines} warehouseId={sourceId} submitted={submitted} />
              </section>

              <section className={styles.panel}>
                <div className={styles.field}>
                  <label htmlFor="tr-notes">Observaciones</label>
                  <Input.TextArea
                    id="tr-notes"
                    rows={2}
                    maxLength={2000}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Opcional · motivo del traslado"
                  />
                </div>
              </section>
            </div>

            <aside className={`${styles.panel} ${styles.summary}`} aria-label="Resumen del traslado">
              <h2 className={styles.panelTitle} style={{ marginBottom: 14 }}>
                Resumen
              </h2>
              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Origen</dt>
                  <dd>{sourceName ?? "—"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Destino</dt>
                  <dd>{destinationName ?? "—"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Lotes</dt>
                  <dd>{lines.filter((l) => l.lot).length}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Unidades</dt>
                  <dd>{fmtQty(lines.reduce((s, l) => s + (l.quantity ?? 0), 0))}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Responsable</dt>
                  <dd>{userName}</dd>
                </div>
              </dl>
              {submitted && !valid && (
                <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Hay datos por corregir." />
              )}
              <Button type="primary" block size="large" loading={register.isPending} onClick={submit}>
                Registrar traslado
              </Button>
            </aside>
          </div>
        )}
      </Container>
    </PopupLayer>
  )
}
