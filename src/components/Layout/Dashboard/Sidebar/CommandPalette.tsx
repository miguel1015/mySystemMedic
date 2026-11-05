"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EnterOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavView, searchViews } from "./navModel";

interface Props {
  open: boolean;
  onClose: () => void;
  views: NavView[];
  recents: NavView[];
  // Se llama después de navegar (p. ej. para cerrar el menú en celular).
  onNavigate?: () => void;
}

const MAX_RESULTS = 40;

// Buscador de vistas (Ctrl + K). Solo lista las vistas que el rol puede abrir, porque
// sale del mismo menú que entrega el backend.
export default function CommandPalette({ open, onClose, views, recents, onNavigate }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sin texto: primero las recientes, después todas.
  const sections = useMemo(() => {
    if (query.trim()) {
      return [{ title: "Resultados", items: searchViews(views, query).slice(0, MAX_RESULTS) }];
    }
    const recentRoutes = new Set(recents.map((r) => r.route));
    return [
      ...(recents.length ? [{ title: "Recientes", items: recents }] : []),
      { title: "Todas las vistas", items: views.filter((v) => !recentRoutes.has(v.route)) },
    ];
  }, [query, views, recents]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Al abrir: campo vacío y con el cursor (autoFocus). Al cerrar: el foco vuelve a
  // donde estaba, para no perder el lugar en la pantalla.
  // Se limpia al cerrar (no al abrir): así lo primero que se escribe al reabrir no se
  // mezcla con la búsqueda anterior.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    return () => {
      setQuery("");
      setActive(0);
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Mantener visible la opción activa al moverse con las flechas.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (view?: NavView) => {
    if (!view) return;
    onClose();
    router.push(view.route);
    onNavigate?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // El único control es el campo: el foco no sale del diálogo.
      e.preventDefault();
    }
  };

  if (!open || typeof document === "undefined") return null;

  let index = -1;

  return createPortal(
    <div className="cp-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Buscar una vista">
      <div className="cp-search">
        <SearchOutlined className="cp-search-icon" aria-hidden />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Buscar una vista: admisiones, triage, evolucionar…"
          aria-label="Buscar una vista"
          role="combobox"
          aria-expanded="true"
          aria-controls="cp-list"
          aria-activedescendant={flat[active] ? `cp-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="cp-kbd">Esc</kbd>
      </div>

      <ul className="cp-list" id="cp-list" role="listbox" ref={listRef} aria-label="Vistas">
        {flat.length === 0 && (
          <li className="cp-empty">
            No hay vistas que coincidan con “{query}”. Revisa la ortografía o prueba con otra palabra.
          </li>
        )}
        {sections.map(
          (section) =>
            section.items.length > 0 && (
              <li key={section.title} role="presentation">
                <div className="cp-section">{section.title}</div>
                <ul role="presentation">
                  {section.items.map((view) => {
                    index += 1;
                    const i = index;
                    return (
                      <li
                        key={`${section.title}-${view.route}`}
                        id={`cp-opt-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        className={`cp-item${i === active ? " is-active" : ""}`}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(view)}
                      >
                        <span className="cp-item-icon" aria-hidden>
                          {view.icon && <FontAwesomeIcon icon={view.icon} />}
                        </span>
                        <span className="cp-item-text">
                          <span className="cp-item-name">{view.name}</span>
                          <span className="cp-item-trail">{view.trail}</span>
                        </span>
                        {i === active && <EnterOutlined className="cp-item-enter" aria-hidden />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ),
        )}
      </ul>

      <div className="cp-footer" aria-hidden>
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> moverse
        </span>
        <span>
          <kbd>Enter</kbd> abrir
        </span>
        <span>
          <kbd>Esc</kbd> cerrar
        </span>
      </div>
      </div>
    </div>,
    document.body,
  );
}
