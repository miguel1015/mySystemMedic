"use client";

import GridContainer from "@/components/componentLayout";
import FileInput from "@/components/fileInput";
import Input from "@/components/input";
import Select from "@/components/select";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { TCreateUser } from "../types";
import UserFormSkeleton from "./useFormSkeleton";
import { useSelectOptions } from "./useSelectOptions";
import { useUserForm } from "./useUserForm";

const UserForm: React.FC<TCreateUser> = ({
  setOpen,
  editUserId,
  setEditUserId,
}) => {
  const dict = useDictionary();
  const { roleOptions, profilesOptions, documentTypesOptions, statusesOptions } =
    useSelectOptions();
  const {
    control,
    handleSubmit,
    watchedValues,
    filteredProfilesByRole,
    onSubmit,
    loadingUser,
    isSubmitting,
  } = useUserForm({ setOpen, editUserId, setEditUserId });

  if (loadingUser) {
    return <UserFormSkeleton />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer gap="g-3">
          <Select
            name="documentTypeId"
            label={dict.users.typeDocument}
            placeholder={dict.users.typeDocument}
            control={control}
            options={documentTypesOptions}
          />
          <Input
            name="documentNumber"
            label={dict.users.numberId}
            placeholder={dict.users.numberId}
            control={control}
          />
          <Input
            name="firstName"
            label={dict.users.names}
            placeholder={dict.users.names}
            control={control}
          />
          <Input
            name="lastName"
            label={dict.users.lastNames}
            placeholder={dict.users.lastNames}
            control={control}
          />
          <Input
            name="username"
            label={dict.users.userID}
            placeholder={dict.users.userID}
            control={control}
          />
          <Select
            name="userRoleId"
            label={dict.users.rol}
            placeholder={dict.users.rol}
            control={control}
            options={roleOptions}
          />
          <Select
            name="userProfileId"
            label={dict.users.userProfile}
            placeholder={dict.users.userProfile}
            control={control}
            options={filteredProfilesByRole(profilesOptions)}
            disabled={!watchedValues.userRoleId}
          />
          <Select
            name="userStatusId"
            label={dict.users.state}
            placeholder={dict.users.state}
            control={control}
            options={statusesOptions}
          />
          <Input
            name="phone"
            label={dict.users.cellphone}
            placeholder={dict.users.cellphone}
            control={control}
          />
          <Input
            name="telephone"
            label={dict.users.telephone}
            placeholder={dict.users.telephone}
            control={control}
          />
          <Input
            name="licenseCard"
            label={dict.users.licenseCard}
            placeholder={dict.users.licenseCard}
            control={control}
          />
          <Input
            name="email"
            label={dict.users.email}
            placeholder={dict.users.email}
            control={control}
          />
          {!editUserId && (
            <Input
              name="password"
              label={dict.users.password}
              placeholder={dict.users.password}
              type="password"
              control={control}
            />
          )}
          {!editUserId && (
            <Input
              name="confirmarContraseña"
              label={dict.users.confirmPassword}
              placeholder={dict.users.confirmPassword}
              type="password"
              control={control}
            />
          )}
          <div className="col-12">
            <FileInput
              name="signature"
              control={control}
              label={dict.users.signature}
              accept="image/*"
              initialPreview={
                typeof watchedValues.signature === "string"
                  ? watchedValues.signature
                  : undefined
              }
            />
          </div>
        </GridContainer>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button type="default" onClick={() => setOpen(false)}>
            {dict.users.cancel}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
          >
            {dict.users.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
