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
    avatar?: string;
    firstName?: string;
    lastName?: string;
    role?: number;
    profileId?: number;
    userProfileName?: number;
    statusId?: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
