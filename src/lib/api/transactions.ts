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
