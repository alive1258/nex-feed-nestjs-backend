export interface ActiveUserData {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  status?: string;
}
