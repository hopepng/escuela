export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface TokenPayload {
  sub: number;
  role: string;
  name: string;
  exp: number;
}