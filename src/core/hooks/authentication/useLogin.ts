import apiClient from "@/core/api/client";
import { ENDPOINTS } from "@/core/api/endpoints";
import { LoginRequest, LoginResponse } from "@/core/interfaces/api/user";
import { useMutation } from "@tanstack/react-query";

const loginRequest = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const { data } = await apiClient.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    credentials
  );
  return data;
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: loginRequest,
  });
};
