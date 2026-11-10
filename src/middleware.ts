import { withAuth } from "next-auth/middleware";
import { SESSION_IDLE_MINUTES } from "@/core/auth/sessionConfig";

// El middleware solo decodifica la cookie (no ejecuta el callback jwt ni puede
// renovar). Un access token vencido no basta para sacar al usuario: mientras siga
// siendo renovable (vencido hace menos que la ventana de inactividad y dentro del
// tope absoluto), la página carga y la renovación ocurre en el servidor/cliente.
export default withAuth({
  callbacks: {
    authorized({ token }) {
      if (!token?.accessToken || token.error) return false;

      const now = Date.now();

      const sessionEnd = token.sessionExpiresAt ? Date.parse(token.sessionExpiresAt) : NaN;
      if (Number.isFinite(sessionEnd) && sessionEnd <= now) return false;

      const expiresAt = token.expiresAt ? Date.parse(token.expiresAt) : NaN;
      if (Number.isFinite(expiresAt) && expiresAt + SESSION_IDLE_MINUTES * 60_000 <= now) {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|ads\\.txt).*)"],
};
