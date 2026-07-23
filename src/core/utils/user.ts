import { GetUser } from "@/core/interfaces/user/users";

export const buildFullName = (user?: GetUser) => {
  if (!user) return "";
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    user.email
  );
};
