"use client"

import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { LeftOutlined, PauseOutlined, CaretRightOutlined, RightOutlined } from "@ant-design/icons"
import styles from "./carousel.module.scss"

export interface CarouselSlide {
  id: string
  label: string
  // `cycle` cambia cada vez que la vista vuelve a mostrarse: las gráficas lo usan para
  // repetir su animación de entrada.
  render: (state: { active: boolean; cycle: number }) => ReactNode
}

interface Props {
  slides: CarouselSlide[]
  interval?: number
}

// Carrusel de vistas del inicio. Avanza solo cada `interval` ms, con flechas, pestañas y
// pausa. Se detiene si la pestaña del navegador no está visible o si el foco del teclado
// está dentro de una vista (WCAG 2.2.2: el movimiento automático debe poder pausarse).
export function DashboardCarousel({ slides, interval = 20_000 }: Props) {
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [cycles, setCycles] = useState<Record<string, number>>({})
  const [userPaused, setUserPaused] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)

  const paused = userPaused || focusInside || pageHidden
  const remaining = useRef(interval)
  const startedAt = useRef(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  // Si cambian los permisos y desaparece una vista, no quedarse en un índice inexistente.
  const safeIndex = Math.min(index, Math.max(count - 1, 0))
  const activeId = slides[safeIndex]?.id

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (count < 2) return
      const target = (next + count) % count
      if (target === safeIndex) return
      setDirection(dir)
      setPrevious(safeIndex)
      setIndex(target)
    },
    [count, safeIndex]
  )

  const next = useCallback(() => goTo(safeIndex + 1, 1), [goTo, safeIndex])
  const prev = useCallback(() => goTo(safeIndex - 1, -1), [goTo, safeIndex])

  // Cada vista nueva arranca con el intervalo completo. Va antes del efecto del temporizador.
  useEffect(() => {
    remaining.current = interval
  }, [safeIndex, interval])

  useEffect(() => {
    if (!activeId) return
    setCycles((c) => ({ ...c, [activeId]: (c[activeId] ?? 0) + 1 }))
  }, [activeId])

  // Temporizador con tiempo restante: al pausar y reanudar continúa donde iba, igual que
  // la barra de progreso (que se congela con animation-play-state).
  useEffect(() => {
    if (paused || count < 2) return
    startedAt.current = Date.now()
    const id = setTimeout(next, remaining.current)
    return () => {
      clearTimeout(id)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current))
    }
  }, [paused, count, next, safeIndex])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // El alto del contenedor sigue a la vista activa (y se anima en CSS), así una vista
  // corta no hereda el hueco de la más alta. ResizeObserver cubre los cambios de alto
  // de la propia vista: datos que terminan de cargar, ventana que cambia de ancho.
  const [height, setHeight] = useState<number | null>(null)
  useEffect(() => {
    const el = slideRefs.current[safeIndex]
    if (!el) return
    const update = () => setHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [safeIndex, count])

  // Las vistas ocultas salen del orden de tabulación y del lector de pantalla.
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return
      if (i === safeIndex) el.removeAttribute("inert")
      else el.setAttribute("inert", "")
    })
  }, [safeIndex, count])

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    let target: number | null = null
    if (e.key === "ArrowRight") target = (safeIndex + 1) % count
    if (e.key === "ArrowLeft") target = (safeIndex - 1 + count) % count
    if (e.key === "Home") target = 0
    if (e.key === "End") target = count - 1
    if (target === null) return
    e.preventDefault()
    goTo(target, target > safeIndex ? 1 : -1)
    tabRefs.current[target]?.focus()
  }

  if (count === 0) return null

  if (count === 1) {
    return <div>{slides[0].render({ active: true, cycle: cycles[slides[0].id] ?? 1 })}</div>
  }

  return (
    <section className={styles.carousel} aria-roledescription="carrusel" aria-label="Vistas del inicio">
      <div className={styles.bar}>
        <div className={styles.tabs} role="tablist" aria-label="Vistas del inicio" onKeyDown={onTabKeyDown}>
          {slides.map((s, i) => {
            const selected = i === safeIndex
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`dash-tab-${s.id}`}
                aria-selected={selected}
                aria-controls={`dash-slide-${s.id}`}
                tabIndex={selected ? 0 : -1}
                className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
                onClick={() => goTo(i, i > safeIndex ? 1 : -1)}
              >
                <span className={styles.tabLabel}>{s.label}</span>
                <span className={styles.track} aria-hidden>
                  {selected && (
                    <span
                      key={`${s.id}-${cycles[s.id] ?? 0}`}
                      className={styles.fill}
                      style={{
                        animationDuration: `${interval}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={prev} aria-label="Vista anterior">
            <LeftOutlined />
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Reanudar el cambio automático" : "Pausar el cambio automático"}
            aria-pressed={userPaused}
          >
            {userPaused ? <CaretRightOutlined /> : <PauseOutlined />}
          </button>
          <button type="button" className={styles.control} onClick={next} aria-label="Vista siguiente">
            <RightOutlined />
          </button>
        </div>
      </div>

      <div
        className={styles.viewport}
        // + 8 px del padding que deja ver los halos de foco
        style={height !== null ? { height: height + 8 } : undefined}
        onFocus={() => setFocusInside(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusInside(false)
        }}
      >
        {slides.map((s, i) => {
          const active = i === safeIndex
          // La vista que sale se va hacia el lado contrario al avance; las demás esperan
          // del lado por el que entrarán.
          const offset = active ? 0 : i === previous ? -direction : direction
          return (
            <div
              key={s.id}
              ref={(el) => {
                slideRefs.current[i] = el
              }}
              id={`dash-slide-${s.id}`}
              role="tabpanel"
              aria-labelledby={`dash-tab-${s.id}`}
              aria-roledescription="vista"
              aria-hidden={!active}
              className={`${styles.slide} ${active ? styles.slideActive : ""}`}
              style={{ "--offset": offset, "--enter": direction } as CSSProperties}
            >
              {s.render({ active, cycle: cycles[s.id] ?? 0 })}
            </div>
          )
        })}
      </div>

      {/* Solo se anuncia el cambio cuando no rota solo, para no interrumpir cada 20 s. */}
      <p className={styles.srOnly} aria-live={paused ? "polite" : "off"}>
        {`Vista ${safeIndex + 1} de ${count}: ${slides[safeIndex].label}`}
      </p>
    </section>
  )
}
