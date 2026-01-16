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
  secondLine: {
    width: "100%",
    height: "1px",
    backgroundColor: "#AFAFAF",
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
    textAlign: "right",
    fontSize: 10,
  },
};

const PageTwo: React.FC = () => {
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

      {/* DESCRIPCION */}
      <div style={styles.row}>
        <div style={styles.label}>Descripción quirúrgica</div>
        <div style={styles.value}>
          POR LO QUE SE DECIDE REALIZAR INCISION DE 4 CM SOBRE EL FOCO, SE
          EXPONE FRACTURA Y SE VERIFICA CON FLUROSCOPIOP LA REDUCCION Y
          LONGITUD, SE RIMA 11 MM, SE REALIZA OSTOESINTESIS CON #1 CLAVO FEMORAL
          CANULADO DE 11 MM X 285 MM EN TITANIO, #1 TORNILLO DE CIERRE PARA
          CLAVO FEMORAL LONG 15.0 MM EN TITANIO, #1 PERNO DE BLOQUEO
          AUTORROSCANTE DE 4.9 X 60MM EN TITANIO, #1 PERNO DE BLOQUEO
          AUTORROSCANTE DE 4.9 X 44MM EN TITANIO, #1 PERNO DE BLOQUEO
          AUTORROSCANTE DE 4.9 X 40MM EN TITANIO, #1 PERNO DE BLOQUEO
          AUTORROSCANTE DE 4.9 X 38MM EN TITANIO, PREVIA IMPACTACION SOBRE EL
          FOCO DE LA FRACTURA DISMINUYENDO EL GAP DE FOCO DE FRACTUARIO. SE
          VERIFICA PASO DE BLOQUEO Y ALNEACION BAJO VISION DIRECTA CON
          FLUROSCUPIO. SE REALIZA LAVADO EXHAUSTIVO CON 2000 CC DE SSN 0.9%, SE
          CIERRA Y SUTURA POR PLANOS HASTA PIEL. SE INMOVILIZA CON FERULA DE
          YESO INGUINOPEDICA, PROCEDIMIENTO SIN COMPLICACIONES
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
          Material de osteosíntesis. #1 CLAVO FEMORAL CANULADO DE 11 MM X 285 MM
          EN TITANIO #1 TORNILLO DE CIERRE PARA CLAVO FEMORAL LONG 15.0 MM EN
          TITANIO #1 PERNO DE BLOQUEO AUTORROSCANTE DE 4.9 X 60MM EN TITANIO #1
          PERNO DE BLOQUEO AUTORROSCANTE DE 4.9 X 44MM EN TITANIO #1 PERNO DE
          BLOQUEO AUTORROSCANTE DE 4.9 X 40MM EN TITANIO #1 PERNO DE BLOQUEO
          AUTORROSCANTE DE 4.9 X 38MM EN TITANIO
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>DURACION</div>
        <div style={styles.value}>91MIN</div>
      </div>
      <div style={styles.secondLine} />

      <div style={styles.row}>
        <div style={styles.label}></div>
        <div style={styles.value}>
          <br />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>Firma</div>
        <div style={styles.value}>
          <br />
        </div>
      </div>
      <div style={styles.secondLine} />
      <div style={styles.row}>
        <div>Medico especialista: JOSE CASTRO</div>
      </div>
      <div style={{ marginTop: "450px" }}>
        <div style={styles.line} />

        <div style={styles.footer}>Página 2 de 2</div>
      </div>
    </div>
  );
};

export default PageTwo;
