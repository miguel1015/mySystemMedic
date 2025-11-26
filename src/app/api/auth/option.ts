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

          // LOGIN
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              Email: email,
              Password: password,
            }
          );

          if (!data?.accessToken) return null;

          return {
            id: email,
            email,
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
          };
        } catch {
          throw new Error("Usuario o contraseña inválidos");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Guardamos token en el JWT
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
        token.email = user.email;
      }
      return token;
    },

    // Construimos session llamando a /users/me
    async session({ session, token }) {
      try {
        if (!token?.accessToken) return session;

        const meResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        const me = meResponse.data;

        // Final user data in session
        session.user = {
          id: me.id,
          email: me.email,
          username: me.username,
          firstName: me.firstName,
          lastName: me.lastName,
          role: me.userRoleId,
          profileId: me.userProfileId,
          statusId: me.userStatusId,
          accessToken: String(token.accessToken),
          expiresAt: String(token.expiresAt),
        };

        return session;
      } catch (e) {
        console.error("❌ Error fetching user/me:", e);
        return session;
      }
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
