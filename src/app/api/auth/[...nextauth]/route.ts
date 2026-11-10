import NextAuth, { User } from "next-auth";
import { authOptions } from "@/app/api/auth/option";

declare module "next-auth" {
  interface User {
    id?: string;
    username?: string;
    token?: string | unknown;
    names?: string;
    rol?: string;
    email: string;
    accessToken?: string;
    expiresAt?: string;
    sessionExpiresAt?: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
    role?: number;
    roleName?: string;
    profileId?: number;
    userProfileName?: number;
    statusId?: number;
  }

  interface Session {
    user: User;
    /** Presente cuando la sesión ya no se puede usar (vencida o renovación rechazada). */
    error?: "SessionExpired" | "RefreshFailed";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    accessToken?: string;
    /** Vencimiento del access token (ISO, UTC). */
    expiresAt?: string;
    /** Tope absoluto de la sesión (ISO, UTC). */
    sessionExpiresAt?: string;
    error?: "SessionExpired" | "RefreshFailed";
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
