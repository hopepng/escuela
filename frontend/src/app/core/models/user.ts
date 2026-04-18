export type Role = 'admin' | 'profesor' | 'estudiante';

export interface RoleResponse {
  id: number;
  name: Role;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleResponse;  // ← objeto, no string
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role_id: number;
}