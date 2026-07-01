"use client"

import { HistoryOutlined } from "@ant-design/icons"
import { motion, useMotionValue } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  getClinicalRecordModule,
  type ClinicalRecordModuleType,
} from "@/core/constants/clinicalRecordModules"
import "./clinicalRecordHistoryModal.css"

export interface ClinicalRecordHistoryTriggerProps {
  moduleType: ClinicalRecordModuleType
  onClick: () => void
}

const STORAGE_KEY = "chrm-fab-position"
const DRAG_CLICK_THRESHOLD = 6

const ClinicalRecordHistoryTrigger = ({
  moduleType,
  onClick,
}: ClinicalRecordHistoryTriggerProps) => {
  const moduleInfo = getClinicalRecordModule(moduleType)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const hasDraggedRef = useRef(false)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const { x: savedX, y: savedY } = JSON.parse(saved)
      if (typeof savedX === "number" && typeof savedY === "number") {
        x.set(savedX)
        y.set(savedY)
      }
    } catch {
      // ignore corrupted value
    }
  }, [x, y])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }
    onClick()
  }

  return (
    <>
      <div ref={constraintsRef} className="chrm-fab-drag-area" />
      <motion.div
        className="chrm-fab-wrapper"
        style={{ x, y }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.18}
        dragMomentum={false}
        onDragStart={() => {
          hasDraggedRef.current = false
          setIsDragging(true)
        }}
        onDrag={(_, info) => {
          if (
            Math.abs(info.offset.x) > DRAG_CLICK_THRESHOLD ||
            Math.abs(info.offset.y) > DRAG_CLICK_THRESHOLD
          ) {
            hasDraggedRef.current = true
          }
        }}
        onDragEnd={() => {
          setIsDragging(false)
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ x: x.get(), y: y.get() }),
          )
        }}
      >
        <motion.button
          type="button"
          className={`chrm-fab${isDragging ? " is-dragging" : ""}`}
          style={{ background: moduleInfo?.color }}
          onClick={handleClick}
          aria-label={`Ver historial de ${moduleInfo?.label ?? "registros"}`}
          animate={
            isDragging
              ? { scale: 1.15 }
              : { scale: [1, 1.08, 1], y: [0, -5, 0] }
          }
          transition={
            isDragging
              ? { duration: 0.15 }
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
          whileHover={!isDragging ? { scale: 1.12 } : undefined}
          whileTap={{ scale: 0.9 }}
        >
          <span className="chrm-fab-icon">
            {moduleInfo?.icon ?? <HistoryOutlined style={{ fontSize: 20 }} />}
          </span>
        </motion.button>
      </motion.div>
    </>
  )
}

export default ClinicalRecordHistoryTrigger
