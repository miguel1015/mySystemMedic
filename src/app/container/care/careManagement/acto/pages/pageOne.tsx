import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 11,
    color: "#000",
    lineHeight: 1.4,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  line: {
    width: "100%",
    height: "1px",
    backgroundColor: "black",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
  },
  subtitle: {
    fontSize: 11,
  },
  row: {
    display: "flex",
    marginBottom: 4,
  },
  label: {
    width: 250,
    fontWeight: "bold",
  },
  labelTitle: {
    width: 150,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  twoCols: {
    display: "flex",
    gap: 30,
  },
  col: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  paragraph: {
    textAlign: "justify",
    marginBottom: 6,
  },
  footer: {
    marginTop: 16,
    textAlign: "right",
    fontSize: 10,
  },
};

const PageOne: React.FC = () => {
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>CLINICA FUNDACION IPS SAS</div>
      </div>

      {/* DATOS PACIENTE */}
      <div style={styles.twoCols}>
        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Paciente:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Sexo:</div>
            <div style={styles.value}>MASCULINO</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Dirección:</div>
            <div style={styles.value}>CL 10A No 3 72 ARIGUANI FUNDACIÓN</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Cotizante:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Empresa:</div>
            <div style={styles.value}>ADRES</div>
          </div>
        </div>

        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Documento de Identidad:</div>
            <div style={styles.value}>CC-72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Ubicación de Historia:</div>
            <div style={styles.value}>CC-72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Tel:</div>
            <div style={styles.value}>3175263488</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Documento Cotizante:</div>
            <div style={styles.value}>CC-72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.labelTitle}>Parentesco:</div>
            <div style={styles.value}>Beneficiario</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          No. Admisión de Urgencia: -1619029917
        </div>
      </div>
      <div style={styles.line} />

      {/* TITULO */}
      <div style={styles.header}>
        <div style={styles.title}>INFORME QUIRURGICO</div>
      </div>
      <div style={styles.line} />

      <div style={styles.row}>
        <div style={styles.labelTitle}>Formato No:</div>
        <div style={styles.value}>43923</div>
      </div>
      <div style={styles.row}>
        <div style={styles.labelTitle}>Edad:</div>
        <div style={styles.value}>55 Años</div>
      </div>
      <div style={styles.line} />

      {/* FECHA */}
      <div style={styles.sectionTitle}>FECHA Y HORA</div>
      <div style={styles.row}>
        <div style={styles.labelTitle}>Fecha:</div>
        <div style={styles.value}>30/05/2025</div>
      </div>
      <div style={styles.row}>
        <div style={styles.labelTitle}>Hora:</div>
        <div style={styles.value}>10:00</div>
      </div>

      {/* REPORTE */}
      <div style={styles.sectionTitle}>REPORTE QUIRURGICO</div>
      <div style={styles.row}>
        <div style={styles.label}>Fecha y Hora de inicio de Procedimiento:</div>
        <div style={styles.value}>30/05/2025 10:00:00 a. m.</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>
          Fecha y Hora de Termino de Procedimiento:
        </div>
        <div style={styles.value}>30/05/2025 11:31:00 a. m.</div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>Diagnóstico Prequirúrgico:</div>
        <div style={styles.value}>
          FRACTURA DE LA DIAFISIS DEL FEMUR
          <br />
          FRACTURA DE LA CLAVICULA
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}></div>
        <div style={styles.value}>
          <br />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>Diagnóstico Postquirúrgico:</div>
        <div style={styles.value}>
          FRACTURA DE LA DIAFISIS DEL FEMUR
          <br />
          FRACTURA DE LA CLAVICULA
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}></div>
        <div style={styles.value}>
          <br />
        </div>
      </div>

      {/* CIRUGIA */}
      <div style={styles.row}>
        <div style={styles.label}>Cirugía(s) realizada(s) y códigos</div>
        <div style={styles.value}>
          79350 - REDUCCION ABIERTA DE FRACTURA EN DIAFISIS DE FEMUR CON
          FIJACION INTERNA (DISPOSITIVOS DE FIJACION U OSTEOSINTESIS)
          <br />
          79310 - REDUCCION ABIERTA DE FRACTURA CON FIJACION INTERNA
          (DISPOSITIVOS DE FIJACION U OSTEOSINTESIS) DE CLAVICULA
        </div>
      </div>
      <br />

      {/* EQUIPO */}
      <div style={styles.row}>
        <div style={styles.label}>Cirujano:</div>
        <div style={styles.value}>JOSE CASTRO PERTUZ</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>1er Ayudante:</div>
        <div style={styles.value}>JOHANA PATRICIA ALVAREZ CASTAÑO</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>Anestesia:</div>
        <div style={styles.value}>ANESTESIA GENERAL</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>Anestesiólogo:</div>
        <div style={styles.value}>JOSE BELENO MUÑOZ</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>Instrumentador(a):</div>
        <div style={styles.value}>JENIFER CASTILLO MORALES</div>
      </div>

      {/* DESCRIPCION */}
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          PACIENTE EN POSICION SEMIRECLINADA, BAJO ANESTESIA GENERAL, PREVIA
          ASEPSIA Y ANTISEPSIA, COLOCACION CAMPOS QUIRURGICOS EN MIEMBRO
          SUPERIOR DERECHO. SE REALIZA INCISION LONGITUDINAL SOBRE BORDE
          SUPERIOR DE CLAVICULA DERECHA, DISECCION POR PLANOS HASTA
          VISUALIZACION DE FRACTURA DE CLAVICULA. SE REALIZA DESPEGAMIENTO
          PERIOSTICO HASTA COLOCACION DE PLACA LCP 3.5 (LCP CLAVICULA X 7
          ORIFICIOS LONG 18MM EN TITANIO) CON #4 TORNILLO DE BLOQUEO
          AUTOTARRAJANTE EN TITANIO DE 3.5 X 22MM Y #3 TORNILLOS CORTICALES
          AUTOTARRAJANTES EN TITANIO DE 3.5 X 24 MM, BUSCANDO ALINEACION Y
          AFRONTACION DE LOS FRAGMENTOS. SE TERMINA FIJACION BAJO INTENSIFICADOR
          DE IMAGENES, SE VERIFICA REDUCCION ESTABLE Y POSICION ADECUADA DE
          MATERIAL DE OSTEOSINTESIS. SE REALIZA HEMOSTASIA, SE SUTURA POR PLANOS
          HASTA PIEL, SE COLOCAN APOSITOS ESTERILES, INMOVILIZACION CON VENDAJE
          EN 8 DE GUARNISO. PACIENTE TOLERA PROCEDIMIENTO.
          <br />
          Materiales quirúrgicos #2 CLAVOS DE KIRSCHNER DE 1.2 X 150
          <br />
          #1 PLACA LCP 3.5 DE CLAVICULA X 7 ORIFICIOS LONG 18MM EN TITANIO
          <br />
          #4 TORNILLOS DE BLOQUEO AUTOTARRAJANTE EN TITANIO DE 3.5 X 22MM
          <br />
          #3 TORNILLOS CORTICALES AUTOTARRAJANTE EN TITANIO DE 3.5 X 24 MM ACTO
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}></div>
        <div style={styles.value}>
          <br />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}></div>
        <div style={styles.value}>
          SEGUIDO BAJO MISMO EFECTO ANESTESICO, PACIENTE EN POSICION DECUBITO
          LATERAL, PREVIA ASEPSIA Y ANTISEPSIA, COLOCACION DE CAMPOS QUIRURGICOS
          EN MIEMBRO INFERIOR DERECHO. SE REALIZA INCISION DE 3 CM POR ENCIMA
          DEL VERTICE DEL TROCANTER MAYOR Y PROXIMAL A ESTE, DIVULSION POR
          PLANOS, PIEL, FASCIA DE GLUTEO MEDIO, SE ENCUENTRA PUNTA DEL
          TROCANTER, SE PASA GUIA DE CLAVO INTRAMEDULA DE FEMUR, SE EVIDENCIA
          ACORTAMENTO SOBRE FOCO DE LA FRACTURA
        </div>
      </div>
      <div style={styles.line} />

      <div style={styles.footer}>Página 1 de 2</div>
    </div>
  );
};

export default PageOne;
