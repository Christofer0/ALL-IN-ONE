export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface AuthError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
