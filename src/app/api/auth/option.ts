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
            "https://medinexus-api-bja6aha9esfqa5ga.brazilsouth-01.azurewebsites.net/api/auth/login",
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
        } catch (err) {
          throw new Error("Usuario o contraseña inválidos");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        email: token.email as string,
        accessToken: token.accessToken as string,
        expiresAt: token.expiresAt as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
