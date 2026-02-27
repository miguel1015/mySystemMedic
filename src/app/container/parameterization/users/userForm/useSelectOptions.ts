import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes";
import { useUserProfiles } from "@/core/hooks/users/useProfile";
import { useUserRoles } from "@/core/hooks/users/useRole";
import { useUserStatuses } from "@/core/hooks/users/useStatuses";

export function useSelectOptions() {
  const { data: dataRol } = useUserRoles();
  const { data: dataProfile } = useUserProfiles();
  const { data: dataDocumentType } = useUserDocumentType();
  const { data: dataStatuses } = useUserStatuses();

  const roleOptions = (dataRol ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const profilesOptions = (dataProfile ?? []).map((r) => ({
    value: r.id,
    label: r.name,
    roleId: r.userRoleId,
  }));

  const documentTypesOptions = (dataDocumentType ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const statusesOptions = (dataStatuses ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return { roleOptions, profilesOptions, documentTypesOptions, statusesOptions };
}
