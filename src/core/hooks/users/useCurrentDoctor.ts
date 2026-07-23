"use client";

import { useEffect, useMemo } from "react";
import { buildFullName } from "@/core/utils/user";
import { useAuthSession } from "@/core/hooks/authentication/useAuthSession";
import type { GetUser } from "@/core/interfaces/user/users";
import { useGetUsers } from "./useGetUsers";
import { useGetUserById } from "./useGetByIdUser";
import { useMe } from "./useMeUser";

const ADMIN_ROLE_ID = 1;
const DOCTOR_ROLE_ID = 2;

export interface DoctorOption {
  value: number;
  label: string;
  role?: string;
}

export function useCurrentDoctor() {
  const { data: session, isLoading: isSessionLoading } = useAuthSession();
  const {
    data: users = [],
    isError: usersIsError,
    error: usersError,
  } = useGetUsers();

  const sessionUser = session?.user;
  const currentUserId = sessionUser?.id ? Number(sessionUser.id) : undefined;

  // The full users list (GET_ALL) is admin-only and returns 403 for other
  // roles. GET_BY_ID hits the same guarded controller. /api/users/me is the
  // one users endpoint every authenticated role can call (it's used during
  // login itself), so use it as the fallback source for the own record.
  const {
    data: meByIdRecord,
    isError: meByIdIsError,
    error: meByIdError,
  } = useGetUserById(currentUserId ?? "");
  const { data: meRecord, isError: meIsError, error: meError } = useMe();

  useEffect(() => {
    console.log("========== FIRMA-DEBUG ==========");
    console.log("currentUserId:", currentUserId);
    console.log("GET_ALL /users -> isError:", usersIsError, "status:", (usersError as any)?.message, "count:", users.length);
    console.log("GET_BY_ID /users/:id -> isError:", meByIdIsError, "status:", (meByIdError as any)?.message);
    console.log("GET_BY_ID /users/:id -> raw value:", meByIdRecord);
    console.log("GET /users/me -> isError:", meIsError, "status:", (meError as any)?.message);
    console.log("GET /users/me -> raw value:", meRecord);
    console.log("GET /users/me -> has 'signature' key:", meRecord ? Object.prototype.hasOwnProperty.call(meRecord, "signature") : "no data");
    console.log("GET /users/me -> keys:", meRecord ? Object.keys(meRecord) : "no data");
    console.log("==================================");
  }, [currentUserId, users, usersIsError, usersError, meByIdRecord, meByIdIsError, meByIdError, meRecord, meIsError, meError]);

  const currentDoctorUser = useMemo(() => {
    const fromList = users.find((user) => user.id === currentUserId);
    if (fromList?.signature) return fromList;
    const source = meByIdRecord ?? meRecord;
    if (source && currentUserId !== undefined) {
      return { ...fromList, ...source, id: currentUserId } as GetUser;
    }
    return fromList;
  }, [users, currentUserId, meByIdRecord, meRecord]);

  console.log("[useCurrentDoctor] currentDoctorUser", currentDoctorUser);

  const users_ = useMemo(() => {
    if (!currentDoctorUser || currentUserId === undefined) return users;
    const index = users.findIndex((user) => user.id === currentUserId);
    if (index === -1) return [...users, currentDoctorUser];
    if (users[index] === currentDoctorUser) return users;
    const merged = [...users];
    merged[index] = currentDoctorUser;
    return merged;
  }, [users, currentDoctorUser, currentUserId]);

  const currentDoctor =
    buildFullName(currentDoctorUser) ||
    [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(" ") ||
    "";

  const canAssignDoctor = sessionUser?.role === ADMIN_ROLE_ID;

  const doctorOptions: DoctorOption[] = useMemo(() => {
    const doctors = users_.filter((user) => user.userRoleId === DOCTOR_ROLE_ID);
    const options: DoctorOption[] = doctors.map((user) => ({
      value: user.id,
      label: buildFullName(user),
      role: user.userRoleName,
    }));

    if (
      sessionUser?.role === ADMIN_ROLE_ID &&
      currentUserId !== undefined &&
      !options.some((option) => option.value === currentUserId)
    ) {
      options.unshift({
        value: currentUserId,
        label: currentDoctor,
        role: currentDoctorUser?.userRoleName,
      });
    }

    if (options.length) {
      return options;
    }
    if (!users_.length && currentUserId !== undefined) {
      return [{ value: currentUserId, label: currentDoctor }];
    }
    return [];
  }, [users_, currentUserId, currentDoctor, currentDoctorUser, sessionUser]);

  const defaultDoctorId = useMemo(() => {
    if (
      currentUserId !== undefined &&
      doctorOptions.some((option) => option.value === currentUserId)
    ) {
      return currentUserId;
    }
    return doctorOptions[0]?.value;
  }, [doctorOptions, currentUserId]);

  return {
    me: sessionUser,
    users: users_,
    currentDoctor,
    currentDoctorUser,
    canAssignDoctor,
    doctorOptions,
    defaultDoctorId,
    isLoading: isSessionLoading,
  };
}
