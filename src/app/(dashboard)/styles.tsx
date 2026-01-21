import { CSSProperties } from "react";
const s = (style: CSSProperties) => style;

export const styles = {
  header: s({
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  }),
  containerChildren: s({
    flexGrow: 1,
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    marginBottom: "1.5rem",
  }),
  contentChildren: s({
    width: "100%",
    maxWidth: "1140px",
    marginLeft: "auto",
    marginRight: "auto",
  }),
};
