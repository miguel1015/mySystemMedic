import { Button } from "antd";
import PageOne from "./pages/pageOne";
import PageTwo from "./pages/pageTwo";

const Epicrisis: React.FC<{ setOpen: (open: boolean) => void }> = ({
  setOpen,
}) => {
  const pageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm",
    margin: "0 auto 20px",
    backgroundColor: "#fff",
    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
    pageBreakAfter: "always",
  };

  return (
    <div>
      <div style={pageStyle}>
        <PageOne />
      </div>
      <div style={pageStyle}>
        <PageTwo />
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={() => setOpen(false)}>Cerrar</Button>
      </div>
    </div>
  );
};

export default Epicrisis;
