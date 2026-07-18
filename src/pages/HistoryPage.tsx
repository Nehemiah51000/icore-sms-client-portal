import { useInfiniteQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { getClientTransactions } from '../lib/api/transactions';
import { ApiError } from '../lib/api';
import { Card, CardBody } from '../ui/Card/Card';
import { StatusBadge } from '../ui/StatusBadge/StatusBadge';
import { Button } from '../ui/Button/Button';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';
import { stageLabel, statusToVariant } from '../lib/statusMappings';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['client-transactions'],
    queryFn: ({ pageParam }) => getClientTransactions(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    meta: { silent: true },
  });

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isError) {
    return (
      <QueryErrorState
        message={error instanceof ApiError ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='h-24 rounded-xl bg-bg-surface animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-16 text-center'>
        <Receipt className='h-10 w-10 text-text-muted' />
        <p className='text-sm font-medium text-text-main'>
          No transactions yet
        </p>
        <p className='text-xs text-text-muted max-w-xs'>
          Once you load credit, your transaction history will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {transactions.map((txn) => (
        <Card key={txn.id}>
          <CardBody className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-text-muted'>
                {formatDate(txn.created_at)}
              </span>
              <StatusBadge status={statusToVariant(txn.status)} size='sm'>
                {stageLabel(txn.stage)}
              </StatusBadge>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-base font-semibold text-text-main'>
                  KES {txn.amount_kes}
                </p>
                <p className='text-xs text-text-muted'>{txn.provider.name}</p>
              </div>
              {txn.mpesa_receipt_number && (
                <span className='text-xs font-mono text-text-muted'>
                  {txn.mpesa_receipt_number}
                </span>
              )}
            </div>

            {txn.stage === 'failed' && txn.failure_reason && (
              <p className='text-xs text-red-600 pt-1 border-t border-border-main'>
                {txn.failure_reason}
              </p>
            )}
          </CardBody>
        </Card>
      ))}

      {hasNextPage && (
        <Button
          variant='secondary'
          fullWidth
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}>
          Load More
        </Button>
      )}
    </div>
  );
}
