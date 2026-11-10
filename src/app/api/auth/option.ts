import NextAuth, { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { SESSION_MAX_HOURS, REFRESH_BEFORE_MS } from "@/core/auth/sessionConfig";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BackendAuthResponse {
  accessToken: string;
  expiresAt: string;
  sessionExpiresAt?: string;
}

// El backend devuelve fechas UTC sin "Z"; se normalizan para que Date las lea como UTC.
function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasZone ? value : `${value}Z`).toISOString();
}

function fallbackSessionEnd(): string {
  return new Date(Date.now() + SESSION_MAX_HOURS * 3600_000).toISOString();
}

/* =========================================================================
 * Renovación del access token contra MediNexus (/api/auth/refresh).
 * Devuelve null si el backend rechaza el token (sesión vencida, usuario
 * inactivo, tope absoluto). Lanza si el backend no responde (red, cold start),
 * para no cerrar la sesión por un fallo pasajero.
 * ========================================================================= */
async function refreshAccessToken(accessToken: string): Promise<BackendAuthResponse | null> {
  try {
    const { data } = await axios.post<BackendAuthResponse>(
      `${API_URL}/api/auth/refresh`,
      { AccessToken: accessToken },
      { timeout: 15000 },
    );
    return data?.accessToken ? data : null;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 400)) {
      return null;
    }
    throw error;
  }
}

async function renewIfNeeded(token: JWT): Promise<JWT> {
  if (token.error || !token.accessToken) return token;

  const now = Date.now();
  const sessionEnd = token.sessionExpiresAt ? Date.parse(token.sessionExpiresAt) : NaN;
  if (Number.isFinite(sessionEnd) && sessionEnd <= now) {
    return { ...token, error: "SessionExpired" };
  }

  const expiresAt = token.expiresAt ? Date.parse(token.expiresAt) : NaN;
  if (Number.isFinite(expiresAt) && expiresAt - now > REFRESH_BEFORE_MS) {
    return token;
  }

  try {
    const renewed = await refreshAccessToken(token.accessToken);
    if (!renewed) return { ...token, error: "RefreshFailed" };

    const user = token.user ? { ...token.user, accessToken: renewed.accessToken } : token.user;
    return {
      ...token,
      user,
      accessToken: renewed.accessToken,
      expiresAt: toIso(renewed.expiresAt),
      sessionExpiresAt: toIso(renewed.sessionExpiresAt) ?? token.sessionExpiresAt,
    };
  } catch (error) {
    // Backend caído o lento: se conserva el token y se reintenta en la próxima llamada.
    console.error("[auth] refresh failed (transient):", axios.isAxiosError(error) ? error.message : error);
    return token;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const { username, password } = credentials;

          const { data } = await axios.post<BackendAuthResponse>(`${API_URL}/api/auth/login`, {
            Username: username,
            Password: password,
          });

          if (!data?.accessToken) return null;

          const { data: me } = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });

          return {
            id: String(me.id),
            email: me.email,
            username: me.username,
            firstName: me.firstName,
            lastName: me.lastName,
            role: me.userRoleId,
            roleName: me.userRoleName,
            profileId: me.userProfileId,
            userProfileName: me.userProfileName,
            statusId: me.userStatusId,
            accessToken: data.accessToken,
            expiresAt: toIso(data.expiresAt),
            sessionExpiresAt: toIso(data.sessionExpiresAt) ?? fallbackSessionEnd(),
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("[authorize] login failed:", {
              url: `${API_URL}/api/auth/login`,
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
          } else {
            console.error("[authorize] unexpected error:", error);
          }
          throw new Error("Usuario o contraseña inválidos");
        }
      },
    }),
  ],

  // La cookie de NextAuth no vive más que el tope absoluto de la sesión.
  session: { strategy: "jwt", maxAge: SESSION_MAX_HOURS * 3600 },

  callbacks: {
    /* =====================================================
     * JWT: renueva el access token cuando está por vencer.
     * Solo queda persistido cuando lo llama /api/auth/session
     * (getSession en el navegador); getServerSession renueva
     * en memoria para esa petición sin reescribir la cookie.
     * ===================================================== */
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          user,
          accessToken: user.accessToken,
          expiresAt: user.expiresAt,
          sessionExpiresAt: user.sessionExpiresAt ?? fallbackSessionEnd(),
          error: undefined,
        };
      }

      // Sesiones creadas antes de este cambio no traen tope absoluto.
      if (!token.sessionExpiresAt) token.sessionExpiresAt = fallbackSessionEnd();

      return renewIfNeeded(token);
    },

    /* =====================================================
     * SESSION: solo lee del token, sin HTTP.
     * ===================================================== */
    async session({ session, token }) {
      if (token.error || !token.accessToken || !token.user) {
        session.error = token.error ?? "SessionExpired";
        return session;
      }

      session.user = {
        ...token.user,
        accessToken: String(token.accessToken),
        expiresAt: token.expiresAt,
        sessionExpiresAt: token.sessionExpiresAt,
      };

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
