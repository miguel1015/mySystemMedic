export interface UserRole {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
}
export interface UserProfile {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
}

export interface UserCreateUser {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  userProfileId: number;
  userRoleId: number;
  userStatusId: number;
  email: string;
  password: string;
}

export interface GetUser {
  id: number;
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  userProfileId: number;
  userRoleId: number;
  userStatusId: number;
  email: string;
  password: string;
  isActive: number;
  createdAt: string;
}
