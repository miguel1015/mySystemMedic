import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDictionary } from "@/locales/dictionary";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { username, password } = credentials;
        const dict = await getDictionary();

        // Ejemplo de autenticación estática
        const ok = username === "Username" && password === "Password";

        if (!ok) {
          throw new Error(dict.login.message.auth_failed);
        }

        return {
          id: 1,
          name: "Name",
          username: "Username",
          email: "user@email.com",
          avatar: "/assets/img/avatars/narutico.jpg",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as User;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as User;
      return session;
    },
  },

  // 🔒 Requerido en producción
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Recomendado: define el tipo de sesión
  session: {
    strategy: "jwt",
  },

  // ✅ Opcional: define rutas personalizadas
  pages: {
    signIn: "/login",
    error: "/api/auth/error",
  },
};
