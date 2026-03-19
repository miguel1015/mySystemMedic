import { CSSProperties } from "react";
const s = (style: CSSProperties) => style;

export const styles = {
  header: s({
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "var(--dash-bg, #f8f9fb)",
  }),
  containerChildren: s({
    flexGrow: 1,
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    paddingTop: "0.5rem",
    marginBottom: "1.5rem",
  }),
  contentChildren: s({
    width: "100%",
    maxWidth: "1280px",
    marginLeft: "auto",
    marginRight: "auto",
  }),
};
