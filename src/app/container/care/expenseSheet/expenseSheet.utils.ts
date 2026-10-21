import type {
  ConceptoTipo,
  HojaGastoRegistro,
  TipoHojaGastos,
} from "@/core/interfaces/care/hojaGastos"

export const HOJA_TEXTOS: Record<
  TipoHojaGastos,
  { titulo: string; descripcion: string; atencion: string; tituloImpresion: string }
> = {
  Hospitalizacion: {
    titulo: "Hoja de Gastos Hospitalización",
    descripcion:
      "Registro de medicamentos, insumos quirúrgicos y material estéril utilizados durante la hospitalización del paciente.",
    atencion: "esta hospitalización",
    tituloImpresion: "Hoja de gastos Hospitalización",
  },
  Urgencias: {
    titulo: "Hoja de Gastos de Urgencias",
    descripcion:
      "Registro de medicamentos, insumos quirúrgicos y material estéril utilizados durante la atención de urgencias del paciente.",
    atencion: "esta atención de urgencias",
    tituloImpresion: "Hoja de gastos Urgencias",
  },
  Cirugia: {
    titulo: "Hoja de Gastos de Cirugía",
    descripcion:
      "Registro de medicamentos, insumos quirúrgicos y material estéril utilizados en el acto quirúrgico del paciente.",
    atencion: "esta cirugía",
    tituloImpresion: "Hoja de gastos Cirugía",
  },
}

const TIPO_CONCEPTO_LABEL: Record<ConceptoTipo, string> = {
  device: "Insumo",
  medicine: "Medicamento",
  tariff: "Procedimiento",
}

export interface ConceptoConsolidado {
  key: string
  tipo: string
  codigo: string
  descripcion: string
  cantidad: number
}

// Un renglón por concepto con la suma de todos sus registros, como en el
// formato impreso de la hoja de gastos.
export const consolidarRegistros = (registros: HojaGastoRegistro[]): ConceptoConsolidado[] => {
  const porConcepto = new Map<string, ConceptoConsolidado>()
  for (const r of registros) {
    const key = `${r.conceptoTipo}|${r.conceptoId}`
    const actual = porConcepto.get(key)
    if (actual) actual.cantidad += r.cantidad
    else
      porConcepto.set(key, {
        key,
        tipo: TIPO_CONCEPTO_LABEL[r.conceptoTipo] ?? r.tipoServicio,
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
      })
  }
  return [...porConcepto.values()].sort(
    (a, b) => a.tipo.localeCompare(b.tipo) || a.descripcion.localeCompare(b.descripcion),
  )
}

// Asistenciales distintos que firman los registros de la hoja.
export const firmantesDe = (registros: HojaGastoRegistro[]) => {
  const porId = new Map<number, string>()
  for (const r of registros) if (!porId.has(r.asistencialId)) porId.set(r.asistencialId, r.asistencialNombre)
  return [...porId.entries()].map(([id, nombre]) => ({ id, nombre }))
}
