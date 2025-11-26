import apiClient from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints/endpoints";
import { User } from "../../interfaces/api/user";
import { useQuery } from "@tanstack/react-query";

const fetchMe = async (): Promise<User> => {
  const { data } = await apiClient.get(ENDPOINTS.USERS.ME);
  return data;
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
};
