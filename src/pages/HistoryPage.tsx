import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Receipt, Calendar, Filter, X } from 'lucide-react';
import { getClientTransactions } from '../lib/api/transactions';
import { ApiError } from '../lib/api';
import { Card, CardBody } from '../ui/Card/Card';
import { StatusBadge } from '../ui/StatusBadge/StatusBadge';
import { Button } from '../ui/Button/Button';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';
import { stageLabel, statusToVariant } from '../lib/statusMappings';

type DatePreset = 'all' | '7d' | '30d' | 'custom';

// Format individual transaction time
function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Format date section header: e.g. "21 Jul 2026 · Tue"
function formatDateHeader(dateKey: string) {
  const date = new Date(dateKey);
  const dayName = date.toLocaleDateString('en-KE', { weekday: 'short' });
  const dayMonthYear = date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${dayMonthYear} · ${dayName}`;
}

export function HistoryPage() {
  const [preset, setPreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle Preset Changes
  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    const today = new Date();

    if (newPreset === '7d') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (newPreset === '30d') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (newPreset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // React Query with Filter Parameters included in Query Key
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
    queryKey: ['client-transactions', { startDate, endDate }],
    queryFn: ({ pageParam }) =>
      // Pass start/end date stubs to your API call
      // getClientTransactions(pageParam, { startDate, endDate }),
      getClientTransactions(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    meta: { silent: true },
  });

  const rawTransactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Group transactions by date string (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof rawTransactions> = {};

    rawTransactions.forEach((txn) => {
      const dateKey = new Date(txn.created_at).toISOString().split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(txn);
    });

    return Object.entries(groups).map(([dateKey, items]) => {
      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.amount_kes),
        0,
      );
      return {
        dateKey,
        items,
        count: items.length,
        totalAmount,
      };
    });
  }, [rawTransactions]);

  if (isError) {
    return (
      <QueryErrorState
        message={error instanceof ApiError ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {/* --- Filter Bar Header --- */}
      <div className='bg-bg-surface border border-border-main/70 rounded-2xl p-4 shadow-xs space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-navy-500' />
            <span className='text-sm font-semibold text-text-main'>
              Filter History
            </span>
          </div>

          {/* Preset Buttons */}
          <div className='flex items-center gap-1.5 bg-bg-base p-1 rounded-xl border border-border-main/60 text-xs font-medium'>
            {(['all', '7d', '30d', 'custom'] as DatePreset[]).map((type) => (
              <button
                key={type}
                onClick={() => handlePresetChange(type)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  preset === type
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}>
                {type === 'all'
                  ? 'All Time'
                  : type === '7d'
                    ? 'Last 7 Days'
                    : type === '30d'
                      ? 'Last 30 Days'
                      : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs (Visible when Custom is selected) */}
        {preset === 'custom' && (
          <div className='pt-2 border-t border-border-main/50 flex flex-wrap items-center gap-3 animate-page-in'>
            <div className='flex items-center gap-2 bg-bg-base border border-border-main px-3 py-1.5 rounded-xl text-xs'>
              <Calendar className='h-3.5 w-3.5 text-text-muted' />
              <span className='text-text-muted'>From:</span>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='bg-transparent text-text-main focus:outline-none'
              />
            </div>
            <div className='flex items-center gap-2 bg-bg-base border border-border-main px-3 py-1.5 rounded-xl text-xs'>
              <Calendar className='h-3.5 w-3.5 text-text-muted' />
              <span className='text-text-muted'>To:</span>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='bg-transparent text-text-main focus:outline-none'
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => handlePresetChange('all')}
                className='p-1.5 text-text-muted hover:text-red-500 transition-colors'>
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- Loading State --- */}
      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-36 rounded-2xl bg-bg-surface border border-border-main/50 animate-pulse'
            />
          ))}
        </div>
      ) : rawTransactions.length === 0 ? (
        /* --- Empty State --- */
        <div className='flex flex-col items-center justify-center gap-3 py-16 text-center max-w-sm mx-auto'>
          <div className='h-16 w-16 rounded-2xl bg-bg-surface border border-border-main flex items-center justify-center shadow-xs'>
            <Receipt className='h-8 w-8 text-text-muted' />
          </div>
          <p className='text-base font-semibold text-text-main'>
            No entries found
          </p>
          <p className='text-xs text-text-muted leading-relaxed'>
            No transactions match your selected date criteria.
          </p>
        </div>
      ) : (
        /* --- Grouped Journal Style List --- */
        <div className='space-y-6'>
          {groupedTransactions.map((group) => (
            <Card
              key={group.dateKey}
              className='border-border-main/80 overflow-hidden shadow-xs'>
              {/* Day Header Banner */}
              <div className='px-5 py-3.5 bg-bg-base/70 border-b border-border-main/60 flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-bold text-text-main tracking-tight'>
                    {formatDateHeader(group.dateKey)}
                  </h3>
                  <p className='text-[11px] text-text-muted font-medium mt-0.5'>
                    {group.count} {group.count === 1 ? 'entry' : 'entries'}
                  </p>
                </div>

                <div className='text-right'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-text-muted mr-1'>
                    Total
                  </span>
                  <span className='text-sm font-extrabold text-navy-500'>
                    +Ksh {group.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transactions inside the Day Group */}
              <CardBody className='p-3 sm:p-4 space-y-2.5 bg-bg-surface'>
                {group.items.map((txn) => (
                  <div
                    key={txn.id}
                    className='p-3.5 rounded-xl border border-border-main/50 hover:border-border-main bg-bg-surface-hover/30 hover:bg-bg-surface-hover transition-all flex items-center justify-between gap-3'>
                    <div className='space-y-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-semibold text-text-main truncate'>
                          {txn.provider.name}
                        </span>
                        <StatusBadge
                          status={statusToVariant(txn.status)}
                          size='sm'>
                          {stageLabel(txn.stage)}
                        </StatusBadge>
                      </div>
                      <p className='text-[11px] text-text-muted font-mono'>
                        {formatTime(txn.created_at)}
                        {txn.mpesa_receipt_number &&
                          ` · ${txn.mpesa_receipt_number}`}
                      </p>
                    </div>

                    <div className='text-right shrink-0'>
                      <p className='text-sm font-bold text-text-main tracking-tight'>
                        KES {Number(txn.amount_kes).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* --- Infinite Scroll Pagination Button --- */}
      {hasNextPage && (
        <div className='pt-2 flex justify-center max-w-xs mx-auto'>
          <Button
            variant='secondary'
            fullWidth
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            className='hover:scale-[1.02] active:scale-[0.98]'>
            Load Older Entries
          </Button>
        </div>
      )}
    </div>
  );
}
