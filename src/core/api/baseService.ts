import apiClient from "./client";
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

export async function getAll<T>(
  endpoint: string,
  params?: AxiosRequestConfig["params"]
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.get<T>(endpoint, {
      params,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError;

    console.error("Error in getAll:", error.response?.data ?? error.message);
    throw error;
  }
}
