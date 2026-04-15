export type Role = 'admin' | 'profesor' | 'estudiante';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: Role;
}