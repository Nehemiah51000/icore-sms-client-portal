import { api } from '../api';

export interface TransactionStatus {
  id: number;
  stage: 'stk_initiated' | 'payment_confirmed' | 'credit_loaded' | 'failed';
  status: 'pending' | 'success' | 'failed';
  failure_reason: string | null;
}

interface LoadCreditResponse {
  message: string;
  transaction_id: number;
}

export function loadCredit(amount: number, phone: string) {
  return api.post<LoadCreditResponse>('/client/load-credit', { amount, phone });
}

export function getTransactionStatus(id: number) {
  return api.get<TransactionStatus>(`/client/transactions/${id}/status`);
}

export interface ClientTransaction {
  id: number;
  amount_kes: string;
  credits_requested: number;
  stage: 'stk_initiated' | 'payment_confirmed' | 'credit_loaded' | 'failed';
  status: 'pending' | 'success' | 'failed';
  failure_reason: string | null;
  mpesa_receipt_number: string | null;
  created_at: string;
  provider: { id: number; name: string; slug: string };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export function getClientTransactions(page: number) {
  return api.get<PaginatedResponse<ClientTransaction>>(
    `/client/transactions?page=${page}`,
  );
}
