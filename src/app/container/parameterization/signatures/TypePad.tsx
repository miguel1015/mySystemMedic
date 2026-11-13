"use client"

import { useEffect, useState } from "react"
import { Input } from "antd"
import { CheckCircleFilled } from "@ant-design/icons"
import clsx from "clsx"
import { SIGNATURE_FONTS } from "./signatureFonts"
import { renderTypedSignature, type ExportedSignature } from "@/core/utils/signatureImage"
import styles from "./signatures.module.scss"

interface Props {
  color: string
  // Texto inicial (el nombre de la firma) para no tener que escribirlo dos veces.
  initialText: string
  onChange: (result: ExportedSignature | null) => void
}

/** Firma a partir del nombre escrito, en una de varias letras caligráficas. */
export default function TypePad({ color, initialText, onChange }: Props) {
  const [text, setText] = useState(initialText)
  const [fontKey, setFontKey] = useState(SIGNATURE_FONTS[0].key)
  const font = SIGNATURE_FONTS.find((f) => f.key === fontKey) ?? SIGNATURE_FONTS[0]

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await renderTypedSignature(text, font.family, color)
      if (!cancelled) onChange(result)
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, font.family, color])

  const sample = text.trim() || "Su nombre"

  return (
    <div className={styles.workArea}>
      <div>
        <label className={styles.sectionLabel} htmlFor="signature-typed-text">
          Nombre como debe aparecer en la firma
        </label>
        <Input
          id="signature-typed-text"
          size="large"
          value={text}
          maxLength={60}
          placeholder="Ej.: Laura Gómez"
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div>
        <span className={styles.sectionLabel} id="signature-font-label">
          Estilo de letra
        </span>
        <div className={styles.fontGrid} role="radiogroup" aria-labelledby="signature-font-label">
          {SIGNATURE_FONTS.map((option) => {
            const selected = option.key === fontKey
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={selected}
                className={clsx(styles.fontOption, selected && styles.fontOptionSelected)}
                onClick={() => setFontKey(option.key)}
              >
                <span className={styles.fontSample} style={{ fontFamily: option.family, color }}>
                  {sample}
                </span>
                <span className={styles.fontName}>{option.label}</span>
                {selected && <CheckCircleFilled className={styles.fontCheck} aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
      <p className={styles.helper}>
        Útil cuando no hay mouse ni pantalla táctil a mano. Para documentos clínicos se recomienda la
        firma dibujada o la foto de la firma real.
      </p>
    </div>
  )
}
