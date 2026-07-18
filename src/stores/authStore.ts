import { create } from 'zustand';

interface ClientAccount {
  id: number;
  name: string | null;
  login: string;
  phone: string;
  provider_id: number;
}

interface AuthState {
  client: ClientAccount | null;
  token: string | null;
  setAuth: (client: ClientAccount, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  client: null,
  token: localStorage.getItem('icore_client_token'),
  setAuth: (client, token) => {
    localStorage.setItem('icore_client_token', token);
    set({ client, token });
  },
  logout: () => {
    localStorage.removeItem('icore_client_token');
    set({ client: null, token: null });
  },
}));
