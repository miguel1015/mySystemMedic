"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type UrlValues = Record<string, string | undefined>

/**
 * Estado de una vista guardado en la URL (?buscar=…&pagina=2). Sirve para listados que
 * filtran en el servidor: al volver de otra vista, recargar o compartir el enlace, quedan
 * los mismos filtros. (Las tablas que filtran en el navegador usan DataTable con syncUrl.)
 *
 * - Los valores son texto; quien lo usa los convierte (Number(…), etc.).
 * - Un valor igual al de `defaults` o vacío no se escribe en la URL.
 * - La URL se lee después de montar, para no romper la hidratación de Next.
 */
export function useUrlState<T extends UrlValues>(defaults: T) {
  const defaultsRef = useRef(defaults)
  const [state, setState] = useState<T>(defaults)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl: UrlValues = {}
    for (const key of Object.keys(defaultsRef.current)) {
      const value = params.get(key)
      if (value !== null && value !== "") fromUrl[key] = value
    }
    setState((prev) => ({ ...prev, ...fromUrl }))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(state)) {
      if (value === undefined || value === "" || value === defaultsRef.current[key]) params.delete(key)
      else params.set(key, value)
    }
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url)
    }
  }, [state, ready])

  const update = useCallback((patch: Partial<T>) => setState((prev) => ({ ...prev, ...patch })), [])

  return [state, update, ready] as const
}
