"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "antd"
import { ClearOutlined, UndoOutlined } from "@ant-design/icons"
import clsx from "clsx"
import { exportStrokes, paintStrokes, type ExportedSignature, type Stroke } from "@/core/utils/signatureImage"
import styles from "./signatures.module.scss"

interface Props {
  color: string
  onChange: (result: ExportedSignature | null) => void
}

// Grosor del trazo en px de pantalla: fino cuando la mano va rápido, más grueso al ir lento.
const MIN_WIDTH = 1.1
const MAX_WIDTH = 3.8

/** Lienzo para firmar con mouse, dedo o lápiz. */
export default function DrawPad({ color, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const sizeRef = useRef({ width: 0, height: 0 })
  const lastRef = useRef<{ x: number; y: number; t: number; v: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const drawingRef = useRef(false)

  const repaint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    paintStrokes(ctx, strokesRef.current, color, window.devicePixelRatio || 1)
  }, [color])

  const schedulePaint = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      repaint()
    })
  }, [repaint])

  const emit = useCallback(() => {
    const { width, height } = sizeRef.current
    const strokes = strokesRef.current
    onChange(strokes.length ? exportStrokes(strokes, width, height, color) : null)
  }, [color, onChange])

  // Ajusta la resolución del canvas al tamaño real (y a la densidad de la pantalla).
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      sizeRef.current = { width: rect.width, height: rect.height }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      repaint()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [repaint])

  // Al cambiar el color de tinta se repinta y se vuelve a exportar.
  useEffect(() => {
    repaint()
    if (strokesRef.current.length) emit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    },
    [],
  )

  const pointFrom = (e: PointerEvent | React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const widthFor = (velocity: number, e: PointerEvent | React.PointerEvent) => {
    let w = Math.max(MIN_WIDTH, MAX_WIDTH - velocity * 1.4)
    if (e.pointerType === "pen" && e.pressure > 0) w *= 0.45 + e.pressure
    return w
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const { x, y } = pointFrom(e)
    lastRef.current = { x, y, t: e.timeStamp, v: 0 }
    strokesRef.current = [...strokesRef.current, [{ x, y, w: widthFor(0, e) * 0.85 }]]
    drawingRef.current = true
    setDrawing(true)
    schedulePaint()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastRef.current) return
    const stroke = strokesRef.current[strokesRef.current.length - 1]
    const coalesced: PointerEvent[] = e.nativeEvent.getCoalescedEvents?.() ?? []
    for (const ev of coalesced.length ? coalesced : [e.nativeEvent]) {
      const { x, y } = pointFrom(ev)
      const last: { x: number; y: number; t: number; v: number } = lastRef.current!
      const dist = Math.hypot(x - last.x, y - last.y)
      if (dist < 0.8) continue
      const dt = Math.max(1, ev.timeStamp - last.t)
      // Velocidad suavizada para que el grosor no salte de un punto a otro.
      const v: number = last.v * 0.7 + (dist / dt) * 0.3
      stroke.push({ x, y, w: widthFor(v, ev) })
      lastRef.current = { x, y, t: ev.timeStamp, v }
    }
    schedulePaint()
  }

  const finishStroke = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    setDrawing(false)
    lastRef.current = null
    setStrokeCount(strokesRef.current.length)
    emit()
  }

  const undo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokeCount(strokesRef.current.length)
    repaint()
    emit()
  }

  const clear = () => {
    strokesRef.current = []
    setStrokeCount(0)
    repaint()
    onChange(null)
  }

  const isEmpty = strokeCount === 0 && !drawing

  return (
    <div className={styles.workArea}>
      <div ref={wrapRef} className={styles.pad}>
        <span className={styles.padLine} aria-hidden />
        <svg className={styles.padMark} viewBox="0 0 12 12" aria-hidden>
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className={clsx(styles.padHint, !isEmpty && styles.padHintHidden)} aria-hidden>
          Firme aquí con el mouse, el dedo o un lápiz digital
        </span>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Área para dibujar la firma"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onLostPointerCapture={finishStroke}
        />
      </div>
      <div className={styles.row}>
        <p className={styles.helper}>
          Firme sobre la línea, a velocidad normal: el trazo se afina solo, como con un bolígrafo.
        </p>
        <span className={styles.spacer} />
        <Button icon={<UndoOutlined />} onClick={undo} disabled={strokeCount === 0}>
          Deshacer
        </Button>
        <Button icon={<ClearOutlined />} onClick={clear} disabled={strokeCount === 0}>
          Limpiar
        </Button>
      </div>
    </div>
  )
}
