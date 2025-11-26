import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/client";
import { ENDPOINTS } from "../../api/edpoints/endpoints";
import { User } from "../../interfaces/api/user";

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get(ENDPOINTS.USERS.GET_ALL);
  return data;
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};
