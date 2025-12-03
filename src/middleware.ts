import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      // Si no hay token, no está autorizado
      if (!token) return false;

      // Si el token tiene la marca de expirado (puesta en authOptions), forzamos logout
      if (token.expired) {
        return false;
      }

      // Verificación adicional por fecha si existe expiresAt
      if (token.expiresAt) {
        const expiresAt = new Date(token.expiresAt as string);
        if (expiresAt < new Date()) {
          return false;
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/((?!login|register|ads\\.txt).*)"],
};
