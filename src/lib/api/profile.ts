import { api } from '../api';

interface ClientAccount {
  id: number;
  name: string | null;
  login: string;
  phone: string;
  provider_id: number;
}

export function getProfile() {
  return api.get<ClientAccount>('/client/profile');
}

export function updateProfile(payload: { login: string }) {
  return api.put<ClientAccount>('/client/profile', payload);
}

export function updatePassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  return api.put<{ message: string }>('/client/profile/password', payload);
}
