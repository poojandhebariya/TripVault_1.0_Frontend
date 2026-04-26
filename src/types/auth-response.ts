export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  requiresTwoFa?: boolean;
}
