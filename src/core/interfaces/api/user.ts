export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}
