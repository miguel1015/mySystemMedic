"use client"

import type { ReactNode } from "react"
import {
  FURIPS_CONDICIONES_ACCIDENTADO,
  FURIPS_DECLARACION,
  FURIPS_ESTADOS_ASEGURAMIENTO,
  FURIPS_TIPOS_SERVICIO,
  FURIPS_TIPOS_VEHICULO,
  furipsLabel,
} from "@/core/constants/furips"
import type {
  FuripsDatosSistema,
  FuripsDiagnostico,
  FuripsPersona,
  FuripsResponse,
  FuripsUbicacion,
} from "@/core/interfaces/care/furips"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { TCities, TStates } from "@/core/interfaces/user/users"
import { formatDate, formatDateTime } from "@/core/utils/date"
import { mergeAtencion, ubicacion } from "./furips.utils"
import "../../care/clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import "./furips.css"

interface Props {
  provider?: TProvider
  furips: FuripsResponse
  datos: FuripsDatosSistema
  cities: TCities[]
  states: TStates[]
}

const value = (v?: string | number | null) => (v === null || v === undefined || v === "" ? "" : v)

const amount = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const hora = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

// Celda del formato: rótulo pequeño arriba y el dato en negrilla. `span` sobre 12 columnas.
const Cell = ({ label, children, span = 6 }: { label?: string; children?: ReactNode; span?: number }) => (
  <div className="furips-print-cell" style={{ gridColumn: `span ${span}` }}>
    {label && <small>{label}</small>}
    <strong>{children}</strong>
  </div>
)

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="furips-print-grid" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
    {children}
  </div>
)

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="furips-print-section">
    <div className="furips-print-title">{title}</div>
    {children}
  </div>
)

const Header = () => (
  <div className="furips-print-head">
    <img src="/assets/img/furips/escudo-colombia.png" alt="Escudo de Colombia" />
    <div>
      <h1>REPUBLICA DE COLOMBIA</h1>
      <h1>MINISTERIO DE LA PROTECCIÓN SOCIAL</h1>
      <p>
        FORMULARIO ÚNICO DE RECLAMACIÓN DE LAS INSTITUCIONES PRESTADORAS DE SERVICIOS DE SALUD POR
        SERVICIOS PRESTADOS A VICTIMAS DE EVENTOS CATASTRÓFICOS Y ACCIDENTES DE TRANSITO.
      </p>
      <p className="furips-print-kind">PERSONAS JURIDICAS - FURIPS</p>
    </div>
  </div>
)

const Ubicacion = ({
  data,
  telefono,
  municipioLabel = "MUNICIPIO",
}: {
  data: FuripsUbicacion
  telefono?: string | null
  municipioLabel?: string
}) => (
  <>
    <Cell label="DEPARTAMENTO" span={6}>{value(data.departamento)}</Cell>
    <Cell label="COD." span={3}>{value(data.codigoDepartamento)}</Cell>
    <Cell label="TELÉFONO" span={3}>{value(telefono)}</Cell>
    <Cell label={municipioLabel} span={6}>{value(data.municipio)}</Cell>
    <Cell label="COD." span={3}>{value(data.codigoMunicipio)}</Cell>
    <Cell span={3} />
  </>
)

const Persona = ({
  persona,
  ubicacionPersona,
  primerApellidoLabel = "1ER APELLIDO",
}: {
  persona?: FuripsPersona | null
  ubicacionPersona: FuripsUbicacion
  primerApellidoLabel?: string
}) => (
  <Grid>
    <Cell label={primerApellidoLabel} span={6}>{value(persona?.primerApellido)}</Cell>
    <Cell label="2DO. APELLIDO" span={6}>{value(persona?.segundoApellido)}</Cell>
    <Cell label="1ER NOMBRE" span={6}>{value(persona?.primerNombre)}</Cell>
    <Cell label="2DO. NOMBRE" span={6}>{value(persona?.segundoNombre)}</Cell>
    <Cell label="TIPO DE DOCUMENTO" span={6}>{value(persona?.tipoDocumento)}</Cell>
    <Cell label="NO. DOCUMENTO" span={6}>{value(persona?.numeroDocumento)}</Cell>
    <Cell label="DIRECCIÓN RESIDENCIA" span={12}>{value(persona?.direccion)}</Cell>
    <Ubicacion data={ubicacionPersona} telefono={persona?.telefono} municipioLabel="MUNICIPIO RESIDENCIA" />
  </Grid>
)

const dx = (list: FuripsDiagnostico[], i: number) =>
  list[i] ? `${list[i].codigo} - ${list[i].descripcion}` : "-"

export const FuripsPrintDocument = ({ provider, furips, datos, cities, states }: Props) => {
  const { ips, victima } = datos
  const lugar = (cityId?: number | null) => ubicacion(cities, states, cityId)
  // Lo que falte en lo guardado se completa con lo que hoy tiene la historia clínica.
  const atencion = mergeAtencion(furips.atencionMedica, datos.atencionMedica)
  const remision = furips.remision
  const transporte = furips.transporte
  const medico = furips.medico

  return (
    <>
      <div className="hci-print-page furips-print-page">
        <Header />

        <div className="furips-print-section">
          <Grid>
            <Cell label="FECHA RADICACIÓN" span={6}>{formatDate(furips.fechaRadicacion, "")}</Cell>
            <Cell label="NO. RADICADO" span={3}>{value(furips.numeroRadicado)}</Cell>
            <Cell label="RG" span={3}>{furips.respuestaGlosa ? "X" : ""}</Cell>
            <Cell label="NO. RADICADO ANTERIOR (RESPUESTA A GLOSA, MARCAR X EN RG)" span={6}>
              {value(furips.numeroRadicadoAnterior)}
            </Cell>
            <Cell label="NRO FACTURA / CUENTA DE COBRO" span={6}>{value(furips.numeroFactura)}</Cell>
          </Grid>
        </div>

        <Section title="I. DATOS DE LA INSTITUCIÓN PRESTADORA DE SERVICIOS DE SALUD">
          <Grid>
            <Cell label="RAZÓN SOCIAL" span={12}>{value(ips.razonSocial)}</Cell>
            <Cell label="CÓDIGO HABILITACIÓN" span={6}>{value(ips.codigoHabilitacion)}</Cell>
            <Cell label="NIT" span={6}>{value(ips.nit)}</Cell>
            <Cell label="DIRECCIÓN" span={12}>{value(ips.direccion)}</Cell>
            <Ubicacion data={ips} telefono={ips.telefono} />
          </Grid>
        </Section>

        <Section title="II. DATOS DE LA VICTIMA DEL EVENTO CATASTRÓFICO O ACCIDENTE DE TRANSITO">
          <Grid>
            <Cell label="1ER APELLIDO" span={6}>{victima.primerApellido}</Cell>
            <Cell label="2DO. APELLIDO" span={6}>{value(victima.segundoApellido)}</Cell>
            <Cell label="1ER NOMBRE" span={6}>{victima.primerNombre}</Cell>
            <Cell label="2DO. NOMBRE" span={6}>{value(victima.segundoNombre)}</Cell>
            <Cell label="TIPO DE DOCUMENTO" span={6}>{value(victima.tipoDocumento)}</Cell>
            <Cell label="NO. DOCUMENTO" span={6}>{victima.numeroDocumento}</Cell>
            <Cell label="FECHA DE NACIMIENTO" span={6}>{formatDate(victima.fechaNacimiento, "")}</Cell>
            <Cell label="SEXO" span={6}>{value(victima.sexo)}</Cell>
            <Cell label="DIRECCIÓN RESIDENCIA" span={12}>{value(victima.direccion)}</Cell>
            <Ubicacion data={victima} telefono={victima.telefono} />
          </Grid>
          <div className="furips-print-line">
            CONDICIÓN DEL ACCIDENTADO:{" "}
            {FURIPS_CONDICIONES_ACCIDENTADO.map((o) => (
              <span key={o.value} style={{ marginRight: 10 }}>
                <b>[{furips.condicionAccidentado === o.value ? "X" : " "}]</b> {o.label}
              </span>
            ))}
          </div>
        </Section>

        <Section title="III. DATOS DEL SITIO DONDE OCURRIÓ EL EVENTO CATASTRÓFICO O EL ACCIDENTE DE TRANSITO">
          <div className="furips-print-line" style={{ borderTop: "1px solid #555" }}>
            NATURALEZA DEL EVENTO: <b>[X]</b> Accidente de Tránsito
          </div>
          <Grid>
            <Cell label="DIRECCIÓN DE LA OCURRENCIA" span={12}>{furips.direccionEvento}</Cell>
            <Cell label="FECHA EVENTO/ACCIDENTE" span={6}>{formatDate(furips.fechaEvento, "")}</Cell>
            <Cell label="HORA" span={6}>{hora(furips.fechaEvento)}</Cell>
            <Cell label="DEPARTAMENTO" span={6}>{value(lugar(furips.eventoCityId).departamento)}</Cell>
            <Cell label="COD." span={6}>{value(lugar(furips.eventoCityId).codigoDepartamento)}</Cell>
            <Cell label="MUNICIPIO" span={6}>{value(lugar(furips.eventoCityId).municipio)}</Cell>
            <Cell label="COD." span={3}>{value(lugar(furips.eventoCityId).codigoMunicipio)}</Cell>
            <Cell label="ZONA" span={3}>{value(furips.zonaEvento)}</Cell>
            <Cell label="DESCRIPCIÓN BREVE DEL EVENTO CATASTRÓFICO O ACCIDENTE DE TRANSITO" span={12}>
              <span style={{ fontWeight: 400 }}>{furips.descripcionEvento}</span>
            </Cell>
          </Grid>
        </Section>

        <Section title="IV. DATOS DEL VEHICULO DEL ACCIDENTE DE TRANSITO">
          <Grid>
            <Cell label="ESTADO DE ASEGURAMIENTO" span={12}>
              {furipsLabel(FURIPS_ESTADOS_ASEGURAMIENTO, furips.estadoAseguramiento)}
            </Cell>
            <Cell label="MARCA" span={6}>{value(furips.marca)}</Cell>
            <Cell label="PLACA" span={6}>{value(furips.placa)}</Cell>
            <Cell label="TIPO DE VEHÍCULO" span={6}>{furipsLabel(FURIPS_TIPOS_VEHICULO, furips.tipoVehiculo)}</Cell>
            <Cell label="TIPO DE SERVICIO" span={6}>{furipsLabel(FURIPS_TIPOS_SERVICIO, furips.tipoServicio)}</Cell>
            <Cell label="CODIGO ASEGURADORA" span={6}>{value(furips.codigoAseguradora)}</Cell>
            <Cell label="NOMBRE DE LA ASEGURADORA" span={6}>{value(furips.nombreAseguradora)}</Cell>
            <Cell label="NO. DE LA PÓLIZA" span={6}>{value(furips.numeroPoliza)}</Cell>
            <Cell label="SIRAS" span={6}><span style={{ textTransform: "none" }}>{value(furips.siras)}</span></Cell>
            <Cell label="VIGENCIA DESDE" span={6}>{formatDate(furips.vigenciaDesde, "")}</Cell>
            <Cell label="HASTA" span={3}>{formatDate(furips.vigenciaHasta, "")}</Cell>
            <Cell label="COBRO EXCEDENTE PÓLIZA" span={3}>{furips.cobroExcedentePoliza ? "SI" : "NO"}</Cell>
          </Grid>
        </Section>

        <Section title="V. DATOS DEL PROPIETARIO DEL VEHICULO">
          <Persona
            persona={furips.propietario}
            ubicacionPersona={lugar(furips.propietario?.cityId)}
            primerApellidoLabel="1ER APELLIDO O RAZÓN SOCIAL"
          />
        </Section>
      </div>

      <div className="hci-print-page furips-print-page">
        <Header />

        <Section title="VI. DATOS DEL CONDUCTOR DEL VEHÍCULO">
          <Persona persona={furips.conductor} ubicacionPersona={lugar(furips.conductor?.cityId)} />
        </Section>

        <Section title="VII. DATOS DE REMISION">
          {remision ? (
            <Grid>
              <Cell label="IPS QUE REMITE" span={6}>{value(remision.ipsRemiteNombre)}</Cell>
              <Cell label="NIT" span={3}>{value(remision.ipsRemiteNit)}</Cell>
              <Cell label="FECHA DE REMISIÓN" span={3}>{formatDate(remision.fechaRemision, "")}</Cell>
              <Cell label="DIRECCIÓN" span={6}>{value(remision.ipsRemiteDireccion)}</Cell>
              <Cell label="CIUDAD" span={3}>{value(remision.ipsRemiteCiudad)}</Cell>
              <Cell label="TELÉFONO" span={3}>{value(remision.ipsRemiteTelefono)}</Cell>
              <Cell label="PERSONA QUE REMITE" span={12}>{value(remision.personaRemite)}</Cell>
              <Cell label="IPS QUE RECIBE" span={6}>{value(remision.ipsRecibeNombre)}</Cell>
              <Cell label="CIUDAD" span={3}>{value(remision.ipsRecibeCiudad)}</Cell>
              <Cell label="TELÉFONO" span={3}>{value(remision.ipsRecibeTelefono)}</Cell>
              <Cell label="DIRECCIÓN" span={6}>{value(remision.ipsRecibeDireccion)}</Cell>
              <Cell label="PERSONA QUE RECIBE" span={6}>{value(remision.medicoRecibeNombre)}</Cell>
            </Grid>
          ) : (
            <div className="furips-print-empty">Sin datos de remisión registrados.</div>
          )}
        </Section>

        <Section title="VIII. AMPARO DE TRANSPORTE Y MOVILIZACION DE LA VICTIMA">
          <div className="furips-print-line is-italic">
            Diligenciar únicamente para el transporte desde el sitio del evento hasta la primera IPS
            (Transporte Primario)
          </div>
          <Grid>
            <Cell label="DATOS DE VEHICULO — PLACA NO." span={12}>{value(transporte?.placa)}</Cell>
            <Cell label="1ER APELLIDO (CONDUCTOR QUE TRANSPORTA)" span={8}>{value(transporte?.primerApellido)}</Cell>
            <Cell label="2DO. APELLIDO" span={4}>{value(transporte?.segundoApellido)}</Cell>
            <Cell label="1ER NOMBRE" span={8}>{value(transporte?.primerNombre)}</Cell>
            <Cell label="2DO. NOMBRE" span={4}>{value(transporte?.segundoNombre)}</Cell>
            <Cell label="TIPO DE DOCUMENTO" span={8}>{value(transporte?.tipoDocumento)}</Cell>
            <Cell label="NO. DOCUMENTO" span={4}>{value(transporte?.numeroDocumento)}</Cell>
            <Cell label="TRANSPORTO LA VICTIMA DESDE" span={8}>{value(transporte?.transportoDesde)}</Cell>
            <Cell label="ZONA" span={4}>{value(transporte?.zona)}</Cell>
          </Grid>
        </Section>

        <Section title="IX. DATOS DE LA ATENCIÓN MEDICA DE LA VICTIMA COMO PRUEBA DEL ACCIDENTE O EVENTO">
          <Grid>
            <Cell label="FECHA DE INGRESO" span={6}>
              <span className="furips-print-big">{formatDateTime(atencion.fechaIngreso, "")}</span>
            </Cell>
            <Cell label="FECHA DE EGRESO" span={6}>
              <span className="furips-print-big">{formatDateTime(atencion.fechaEgreso, "")}</span>
            </Cell>
            {[0, 1, 2].flatMap((i) => [
              <div key={`i${i}`} className="furips-print-cell furips-print-dx" style={{ gridColumn: "span 6" }}>
                DX {i + 1} INGRESO: {dx(atencion.diagnosticosIngreso, i)}
              </div>,
              <div key={`e${i}`} className="furips-print-cell furips-print-dx" style={{ gridColumn: "span 6" }}>
                DX {i + 1} EGRESO: {dx(atencion.diagnosticosEgreso, i)}
              </div>,
            ])}
          </Grid>
        </Section>

        <Section title="X. DATOS DEL MEDICO O PROFESIONAL DE LA SALUD TRATANTE">
          <Grid>
            <Cell label="1ER APELLIDO DEL MÉDICO O PROFESIONAL TRATANTE" span={4}>{value(medico?.primerApellido)}</Cell>
            <Cell label="2DO. APELLIDO DEL MÉDICO O PROFESIONAL TRATANTE" span={4}>{value(medico?.segundoApellido)}</Cell>
            <Cell span={4} />
            <Cell label="1ER NOMBRE DEL MÉDICO O PROFESIONAL TRATANTE" span={4}>{value(medico?.primerNombre)}</Cell>
            <Cell label="2DO NOMBRE DEL MÉDICO O PROFESIONAL TRATANTE" span={4}>{value(medico?.segundoNombre)}</Cell>
            <Cell span={4} />
            <Cell label="TIPO DOCUMENTO" span={4}>{value(medico?.tipoDocumento)}</Cell>
            <Cell label="NO. DOCUMENTO" span={4}>{value(medico?.numeroDocumento)}</Cell>
            <Cell label="NÚMERO DE REGISTRO MÉDICO" span={4}>{value(medico?.registroMedico)}</Cell>
          </Grid>
        </Section>

        <Section title="XI. AMPAROS QUE RECLAMA">
          <table className="furips-print-amparos">
            <thead>
              <tr>
                <th style={{ width: "46%" }} />
                <th>MARQUE</th>
                <th>VALOR TOTAL FACTURADO</th>
                <th>VALOR RECLAMADO AL ADRES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="is-concept">GASTOS MEDICO QUIRURGICOS</td>
                <td className="is-mark">{furips.amparoGastosMedicos ? "X" : ""}</td>
                <td className="is-value">
                  {furips.amparoGastosMedicos ? amount(furips.valorFacturadoGastosMedicos) : ""}
                </td>
                <td className="is-value">
                  {furips.amparoGastosMedicos ? amount(furips.valorReclamadoGastosMedicos) : ""}
                </td>
              </tr>
              <tr>
                <td className="is-concept">GASTOS DE TRANSPORTE Y MOVILIZACION DE LA VICTIMA</td>
                <td className="is-mark">{furips.amparoTransporte ? "X" : ""}</td>
                <td className="is-value">
                  {furips.amparoTransporte ? amount(furips.valorFacturadoTransporte) : ""}
                </td>
                <td className="is-value">
                  {furips.amparoTransporte ? amount(furips.valorReclamadoTransporte) : ""}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="furips-print-line is-italic" style={{ border: "none" }}>
            El total facturado y reclamado descrito en este numeral se debe detallar y hacer descripcion de
            las actividades, procedimientos, medicamentos, insumos, suministros y materiales, dentro del
            anexo técnico numero 2.
          </div>
        </Section>

        <Section title="XII. DECLARACIONES DE LA INSTITUCION PRESTADORA DE SERVICIOS DE SALUD">
          <div className="furips-print-declaration">
            <p>{FURIPS_DECLARACION}</p>
            <div className="furips-print-name">
              NOMBRE: <b>{value(ips.representanteLegal ?? provider?.legalRepresentative)}</b>
            </div>
            <div className="furips-print-signature">
              {provider?.legalRepresentativeSign && (
                <img src={provider.legalRepresentativeSign} alt="Firma del representante legal" />
              )}
              <span>FIRMA DEL REPRESENTANTE LEGAL, GERENTE O SU DELEGADO</span>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
