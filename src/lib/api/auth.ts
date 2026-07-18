import { api } from '../api';

interface ClientAccount {
  id: number;
  name: string | null;
  login: string;
  phone: string;
  provider_id: number;
}

interface LoginResponse {
  client: ClientAccount;
  token: string;
}

export function loginClient(login: string, password: string) {
  return api.post<LoginResponse>('/client/login', { login, password });
}
