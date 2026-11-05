"use client"

import { DayLine } from "../sections/DayLine"
import { OngoingCare, PendingBilling } from "../sections/PatientLists"
import { ContractsItem, MedicinesItem, TariffsItem } from "../sections/SystemSetup"
import styles from "../dashboard.module.scss"

export interface TodayAccess {
  day: boolean
  ongoing: boolean
  billing: boolean
  contracts: boolean
  medicines: boolean
  tariffs: boolean
}

export function hasTodayContent(a: TodayAccess) {
  return a.day || a.ongoing || a.billing || a.contracts || a.medicines || a.tariffs
}

// Vista 1: lo que pasa hoy. Es el inicio original, sin cambios de comportamiento.
export function TodaySlide({ access, now }: { access: TodayAccess; now: Date }) {
  const showSetup = access.contracts || access.medicines || access.tariffs

  if (!hasTodayContent(access)) {
    return (
      <div className={styles.panel}>
        <p className={styles.emptyText}>
          Tu rol todavía no tiene módulos con información para el inicio. Usa el menú lateral
          para abrir las vistas habilitadas, o pídele al SuperAdmin que te asigne permisos.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.slideStack}>
      {access.day && <DayLine now={now} />}

      {(access.ongoing || access.billing) && (
        <div className={styles.columns}>
          {access.ongoing && <OngoingCare now={now} />}
          {access.billing && <PendingBilling now={now} />}
        </div>
      )}

      {showSetup && (
        <section className={styles.setup} aria-label="Configuración del sistema">
          <h2 className={styles.setupHeading}>Configuración</h2>
          <ul className={styles.setupList}>
            {access.contracts && <ContractsItem now={now} />}
            {access.medicines && <MedicinesItem />}
            {access.tariffs && <TariffsItem />}
          </ul>
        </section>
      )}
    </div>
  )
}
