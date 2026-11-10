import axios from "axios";
import { getAccessToken } from "./getToken";
import { reportUnauthorized } from "@/core/auth/sessionEvents";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  // getSession renueva el token si está por vencer, así que siempre llega vigente.
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      reportUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
