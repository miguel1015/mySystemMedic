import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const { email, password } = credentials;

          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              Email: email,
              Password: password,
            }
          );

          if (!data?.accessToken) return null;

          const { data: me } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
            { headers: { Authorization: `Bearer ${data.accessToken}` } }
          );

          return {
            id: String(me.id),
            email: me.email,
            username: me.username,
            firstName: me.firstName,
            lastName: me.lastName,
            role: me.userRoleId,
            profileId: me.userProfileId,
            userProfileName: me.userProfileName,
            statusId: me.userStatusId,
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
          };
        } catch {
          throw new Error("Usuario o contraseña inválidos");
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    /* =====================================================
     * 🔹 JWT CALLBACK — NO ROMPAS LA EJECUCIÓN
     * ===================================================== */
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
        return token;
      }

      const expiresAt = token.expiresAt as string | undefined;
      if (!expiresAt || new Date(expiresAt) < new Date()) {
        token.expired = true;
      }

      return token;
    },

    /* =====================================================
     * 🔹 SESSION CALLBACK — SOLO LEE DEL TOKEN, SIN HTTP
     * ===================================================== */
    async session({ session, token }) {
      if (token.expired || !token.accessToken || !token.user) {
        return session;
      }

      session.user = {
        ...token.user,
        accessToken: String(token.accessToken),
        expiresAt: String(token.expiresAt),
      };

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
