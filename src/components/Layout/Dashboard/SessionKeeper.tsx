"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { getSession, signOut } from "next-auth/react";
import {
  IDLE_WARNING_SECONDS,
  SESSION_IDLE_MINUTES,
  type SessionEndReason,
} from "@/core/auth/sessionConfig";
import { UNAUTHORIZED_EVENT, isAppApiUrl, reportUnauthorized } from "@/core/auth/sessionEvents";

/*
 * Mantiene la sesión viva mientras el usuario trabaja y la cierra por inactividad.
 *
 * - Actividad = mouse, teclado, scroll o toques. Se comparte entre pestañas por
 *   localStorage, así trabajar en una pestaña no cierra la otra.
 * - Si hubo actividad, cada minuto consulta /api/auth/session: el callback jwt
 *   renueva el access token cuando está por vencer y la cookie queda actualizada.
 *   Así no expira mientras se escribe una nota larga sin guardar.
 * - Tras SESSION_IDLE_MINUTES sin actividad cierra sesión, con un aviso previo.
 * - Un 401 de las rutas /api de la app comprueba la sesión y, si murió, lleva al
 *   login con un mensaje claro en vez de dejar la pantalla con errores.
 */

const ACTIVITY_KEY = "dm:last-activity";
const ENDED_KEY = "dm:session-ended";
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart"] as const;

const IDLE_MS = SESSION_IDLE_MINUTES * 60_000;
const WARNING_MS = IDLE_WARNING_SECONDS * 1000;
const ACTIVITY_THROTTLE_MS = 5_000;
const KEEPALIVE_EVERY_MS = 60_000;
const TICK_MS = 1_000;

function readStoredActivity(): number {
  try {
    return Number(window.localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* almacenamiento bloqueado: se sigue con el estado en memoria */
  }
}

export default function SessionKeeper() {
  const lastActivityRef = useRef(Date.now());
  const lastKeepAliveRef = useRef(Date.now());
  const warningRef = useRef(false);
  const endingRef = useRef(false);
  const checkingRef = useRef(false);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const endSession = useCallback(async (reason: SessionEndReason, broadcast = true) => {
    if (endingRef.current) return;
    endingRef.current = true;
    if (broadcast) writeStorage(ENDED_KEY, `${reason}:${Date.now()}`);

    const back = `${window.location.pathname}${window.location.search}`;
    const params = new URLSearchParams({ reason, callbackUrl: back });
    await signOut({ callbackUrl: `/login?${params.toString()}` });
  }, []);

  // Pide la sesión al servidor (renueva el token si hace falta y reescribe la cookie).
  const keepAlive = useCallback(async () => {
    if (checkingRef.current || endingRef.current) return;
    checkingRef.current = true;
    lastKeepAliveRef.current = Date.now();
    try {
      const session = await getSession();
      if (!session?.user?.accessToken || session.error) {
        await endSession("expired");
      }
    } catch {
      // Red caída: se reintenta en el próximo ciclo sin cerrar la sesión.
    } finally {
      checkingRef.current = false;
    }
  }, [endSession]);

  const markActivity = useCallback((force = false) => {
    if (warningRef.current && !force) return; // con el aviso abierto solo cuenta el botón
    const now = Date.now();
    if (!force && now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    writeStorage(ACTIVITY_KEY, String(now));
  }, []);

  const continueWorking = useCallback(() => {
    warningRef.current = false;
    setSecondsLeft(null);
    markActivity(true);
    void keepAlive();
  }, [keepAlive, markActivity]);

  // Ciclo principal: inactividad, aviso y renovación.
  useEffect(() => {
    writeStorage(ACTIVITY_KEY, String(lastActivityRef.current));

    const tick = () => {
      if (endingRef.current) return;
      const now = Date.now();
      const last = Math.max(lastActivityRef.current, readStoredActivity());
      lastActivityRef.current = last;
      const idle = now - last;

      if (idle >= IDLE_MS) {
        void endSession("idle");
        return;
      }

      if (idle >= IDLE_MS - WARNING_MS) {
        warningRef.current = true;
        setSecondsLeft(Math.max(0, Math.ceil((IDLE_MS - idle) / 1000)));
        return;
      }

      if (warningRef.current) {
        // Otra pestaña registró actividad: se retira el aviso.
        warningRef.current = false;
        setSecondsLeft(null);
      }

      const activeSinceKeepAlive = last > lastKeepAliveRef.current;
      if (activeSinceKeepAlive && now - lastKeepAliveRef.current >= KEEPALIVE_EVERY_MS) {
        void keepAlive();
      }
    };

    const onActivity = () => markActivity();
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === ENDED_KEY && e.newValue) {
        const reason = e.newValue.split(":")[0] === "idle" ? "idle" : "expired";
        void endSession(reason, false);
      }
    };

    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(tick, TICK_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [endSession, keepAlive, markActivity]);

  // 401 de cualquier llamada a /api de la app: se verifica la sesión una vez.
  useEffect(() => {
    const onUnauthorized = () => void keepAlive();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    const originalFetch = window.fetch;
    const watchedFetch: typeof window.fetch = async (input, init) => {
      const res = await originalFetch(input, init);
      if (res.status === 401 && isAppApiUrl(input)) reportUnauthorized();
      return res;
    };
    window.fetch = watchedFetch;

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      if (window.fetch === watchedFetch) window.fetch = originalFetch;
    };
  }, [keepAlive]);

  return (
    <Modal
      open={secondsLeft !== null}
      title="¿Sigues ahí?"
      closable={false}
      maskClosable={false}
      keyboard={false}
      centered
      footer={[
        <Button key="logout" onClick={() => void endSession("idle")}>
          Cerrar sesión
        </Button>,
        <Button key="continue" type="primary" onClick={continueWorking} autoFocus>
          Seguir trabajando
        </Button>,
      ]}
    >
      <p style={{ marginBottom: 0 }}>
        Por seguridad, tu sesión se cerrará por inactividad en{" "}
        <strong>{secondsLeft ?? 0} s</strong>. Lo que no hayas guardado se perderá.
      </p>
    </Modal>
  );
}
