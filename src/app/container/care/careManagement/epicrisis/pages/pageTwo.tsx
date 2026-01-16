import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 11,
    color: "#000",
    padding: "24px",
    width: "100%",
    lineHeight: 1.4,
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 11,
  },
  row: {
    display: "flex",
    marginBottom: 4,
  },
  label: {
    width: 190,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  twoCols: {
    display: "flex",
    gap: 40,
  },
  col: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 6,
  },
  list: {
    marginBottom: 4,
    paddingLeft: 2,
    listStyleType: "none",
  },
  footer: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 10,
  },
  signature: {
    marginTop: 30,
  },
};

const PageTwo: React.FC = () => {
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>CLINICA FUNDACION IPS SAS</div>
        <div style={styles.subtitle}>NIT: 900517542-5</div>
        <div style={styles.subtitle}>TEL: 4131122</div>
        <div style={styles.subtitle}>DIRECCION: CALLE 8 NO 8-121</div>
      </div>

      {/* DATOS PACIENTE */}
      <div style={styles.twoCols}>
        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.label}>PACIENTE:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>SEXO:</div>
            <div style={styles.value}>M</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>DIRECCION:</div>
            <div style={styles.value}>CL 10A NO 3 72</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>COTIZANTE:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>EMPRESA:</div>
            <div style={styles.value}>ADRES</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>EDAD:</div>
            <div style={styles.value}>55 Años</div>
          </div>
        </div>

        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.label}>DOCUMENTO:</div>
            <div style={styles.value}>CC 72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>UBICACIÓN HISTORIA:</div>
            <div style={styles.value}>72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>TEL:</div>
            <div style={styles.value}>3175263488</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>DOC. COTIZANTE:</div>
            <div style={styles.value}>72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>PARENTESCO:</div>
            <div style={styles.value}></div>
          </div>
        </div>
      </div>

      {/* PROCEDIMIENTO */}
      <div style={styles.sectionTitle}>
        REDUCCION ABIERTA DE FRACTURA CON FIJACION INTERNA (DISPOSITIVOS DE
        FIJACION U OSTEO)
      </div>

      {/* TRATAMIENTOS */}
      <div style={styles.row}>
        <div style={styles.label}>TRATAMIENTOS ADMINISTRADOS</div>
        <ul style={styles.list}>
          PROCEDIMIENTOS:
          <li>OBSERVACION</li>
          <li>CANALIZAR SOLUCION SALINA 0.9% 60 CC X HORA</li>
          <li>DIPIRONA AMP 2.5 GR, VIA INTRAVENOSA AHORA</li>
          <li>DEXAMETASONA AMP 8 MG, VIA INTRAVENOSA AHORA</li>
          <li>DICLOFENACO AMP 75 MG, VIA INTRAVENOSA AHORA</li>
          <li>S/S RADIOGRAFIA DE HOMBRO DERECHO</li>
          <li>S/S RADIOGRAFIA DE FEMUR DERECHO (AP Y LATERAL)</li>
          <li>REVALORAR CON RESULTADOS IMAGENOLOGICOS</li>
          <li>CONTROL DE SIGNOS VITALES Y ANOTAR</li>
          <li>AVISAR EVENTUALIDAD</li>
        </ul>
      </div>

      {/* JUSTIFICACION EGRESO */}
      <div style={styles.row}>
        <div style={styles.label}>JUSTIFICACION DE EGRESO</div>
        <div style={styles.value}>
          PACIENTE DE SEXO MASCULINO REFIERE SENTIRSE BIEN SIN DOLOR EN SU
          POSTOPERATORIO OSTEOSINTESIS CLAVICULA DERECHA OSTEOSINTESIS DE FEMUR
          DERECHO, CONSCIENTE, ORIENTADO, CON BUENA ASPECTO GENERAL TOLERANDO
          VIA ORAL, SIN COMPLICACIONES. ES VALORADO POR ORTOPEDISTA CON IMAGENES
          RADIOLOGICAS DE CONTROL DE CLAVICULA Y FEMUR DERECHO, QUE MUESTRAN
          REDUCCION ADECUADA Y ESTABLE DE FRACTURA, LLENADO CAPILAR ADECUADO,
          NEUROVASCULAR DISTAL CONSERVADO, CON MOVILIDAD FUNCIONAL Y TOLERABLE.
          SE DECIDE DAR DE ALTA MEDICA POR ORTOPEDIA CON RECOMENDACIONES
          GENERALES Y SIGNOS DE ALARMA FORMULA MEDICA MAS CITA DE CONTROL EN 15
          DIAS POR CONSULTA EXTERNA.
        </div>
      </div>

      {/* ALTA MEDICA */}
      <div style={styles.row}>
        <div style={styles.label} />
        <ul style={styles.list}>
          ALTA MEDICA
          <li>NAPROXENO TAB 500 MG, VIA ORAL 1 CADA 12 HORAS POR 7 DIAS #14</li>
          <li>CEFALEXINA TAB 500 MG, VIA ORAL 1 CADA 6 HORAS POR 7 DIAS #28</li>
          <li>
            ACETAMINOFEN TAB 500 MG, VIA ORAL 1 CADA 8 HORAS POR 7 DIAS #21
          </li>
          <li>REPOSO EN CAMA</li>
        </ul>
      </div>

      {/* DIAGNOSTICO EGRESO */}
      <div style={styles.row}>
        <div style={styles.label}>DIAGNOSTICO DEL EGRESO</div>
        <ul style={styles.list}>
          <li>FRACTURA DE LA CLAVICULA</li>
          <li>FRACTURA DE LA DIAFISIS DEL FEMUR</li>
        </ul>
      </div>

      {/* FIRMA */}
      <div style={styles.signature}>
        <div style={styles.row}>
          <div style={styles.label}>FIRMA</div>
        </div>
        <div style={styles.row}>
          <div style={styles.label}>MEDICO GENERAL:</div>
          <div style={styles.value}>NATALIA ROPAIN</div>
        </div>
        <div style={styles.row}>
          <div style={styles.label}>REGISTRO No:</div>
          <div style={styles.value}>89134</div>
        </div>
        <div style={styles.paragraph}>
          EL SUSCRITO MEDICO CERTIFICA LA RELACION CAUSAL DIRECTA ENTRE LAS
          LESIONES QUE PRESENTA EL PACIENTE Y EL ACCIDENTE DE TRANSITO.
        </div>
      </div>

      {/* HISTORIA CLINICA */}
      <div style={{ ...styles.sectionTitle, textAlign: "center" }}>
        HISTORIA CLINICA
      </div>

      <div style={styles.sectionTitle}>EVOLUCIONES MEDICAS</div>
      <div style={styles.row}>
        <div style={styles.label}>EVOLUCION</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>FECHA:</div>
        <div style={styles.value}>29/05/2025</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>HORA:</div>
        <div style={styles.value}>13:03</div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>DETALLE</div>
        <div style={styles.value}>
          1. RADIOGRAFIA DE HOMBRO DERECHO. <br />
          Hallazgos: Se observa fractura en tercio medio de la clavicula
          desplazada, edema de partes blandas, resto de estructura evaluada se
          encuentran respetada.
        </div>
      </div>

      <div style={styles.footer}>Página 2 de 9</div>
    </div>
  );
};

export default PageTwo;
