import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { UserDocumentType } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userDocumentTypesServices = {
  getAll: () => getAll<UserDocumentType[]>(ENDPOINTS.DOCUMENT_TYPES.GET_ALL),
};

export function useUserDocumentType() {
  return useQuery({
    queryKey: ["document-types"],
    queryFn: userDocumentTypesServices.getAll,
  });
}
