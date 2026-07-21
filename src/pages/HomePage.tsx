import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Hash, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  loadCreditSchema,
  type LoadCreditFormValues,
} from '../lib/schemas/loadCreditSchema';
import { loadCredit, getTransactionStatus } from '../lib/api/transactions';
import { useAuthStore } from '../stores/authStore';
import { ApiError } from '../lib/api';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Card, CardBody } from '../ui/Card/Card';
import { PhoneInput } from '../ui/PhoneInput/PhoneInput';

const stageCopy: Record<string, { label: string; helper: string }> = {
  stk_initiated: {
    label: 'Enter your M-Pesa PIN',
    helper:
      'Check your phone for the STK push prompt and enter your PIN to confirm.',
  },
  payment_confirmed: {
    label: 'Payment confirmed',
    helper: 'Loading your credit now — this only takes a moment.',
  },
  credit_loaded: {
    label: 'Credit loaded!',
    helper: 'Your SMS credit has been added to your account.',
  },
  failed: {
    label: 'Something went wrong',
    helper: "This transaction didn't complete. You can try again below.",
  },
};

function StatusPanel({
  transactionId,
  onReset,
}: {
  transactionId: number;
  onReset: () => void;
}) {
  const notifiedRef = useRef(false);

  const { data } = useQuery({
    queryKey: ['transaction-status', transactionId],
    queryFn: () => getTransactionStatus(transactionId),
    refetchInterval: (query) => {
      const stage = query.state.data?.stage;
      return stage === 'credit_loaded' || stage === 'failed' ? false : 2000;
    },
    meta: { silent: true },
  });

  useEffect(() => {
    if (!data || notifiedRef.current) return;
    if (data.stage === 'credit_loaded') {
      notifiedRef.current = true;
      toast.success('Credit loaded successfully.');
    } else if (data.stage === 'failed') {
      notifiedRef.current = true;
      toast.error(data.failure_reason ?? 'Transaction failed.');
    }
  }, [data]);

  const stage = data?.stage ?? 'stk_initiated';
  const copy = stageCopy[stage];
  const isTerminal = stage === 'credit_loaded' || stage === 'failed';

  return (
    <Card className='max-w-xl mx-auto shadow-md border-border-main/70'>
      <CardBody className='flex flex-col items-center text-center py-10 px-6 gap-5'>
        <div className='p-3 rounded-2xl bg-bg-base border border-border-main shadow-inner'>
          {stage === 'credit_loaded' ? (
            <CheckCircle2 className='h-12 w-12 text-success-500 animate-bounce' />
          ) : stage === 'failed' ? (
            <XCircle className='h-12 w-12 text-error-500 animate-shake' />
          ) : (
            <Loader2 className='h-12 w-12 text-navy-500 animate-spin' />
          )}
        </div>

        <div>
          <p className='text-lg font-bold text-text-main tracking-tight'>
            {copy.label}
          </p>
          <p className='text-sm text-text-muted mt-1.5 max-w-sm leading-relaxed'>
            {stage === 'failed' && data?.failure_reason
              ? data.failure_reason
              : copy.helper}
          </p>
        </div>

        {isTerminal && (
          <Button
            variant='secondary'
            onClick={onReset}
            className='mt-2 hover:scale-[1.02] active:scale-[0.98]'>
            {stage === 'credit_loaded' ? 'Load More Credit' : 'Try Again'}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export function HomePage() {
  const client = useAuthStore((s) => s.client);
  const [activeTxnId, setActiveTxnId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm<LoadCreditFormValues>({
    resolver: zodResolver(loadCreditSchema),
    defaultValues: { amount: '', phone: client?.phone ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (values: LoadCreditFormValues) =>
      loadCredit(Number(values.amount), values.phone),
    onSuccess: (data) => {
      toast.info('STK push sent. Check your phone.');
      setActiveTxnId(data.transaction_id);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof LoadCreditFormValues, {
            message: messages[0],
          });
        });
      } else {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Could not start payment.',
        );
      }
    },
  });

  function handleReset() {
    setActiveTxnId(null);
    reset({ amount: '', phone: client?.phone ?? '' });
  }

  if (activeTxnId) {
    return <StatusPanel transactionId={activeTxnId} onReset={handleReset} />;
  }

  return (
    <div className='max-w-xl mx-auto space-y-6'>
      <div className='bg-bg-surface border border-border-main/60 p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3'>
        <div className='h-10 w-10 rounded-xl bg-navy-500/10 text-navy-500 flex items-center justify-center shrink-0 font-bold text-base'>
          👋
        </div>
        <div>
          <h2 className='text-base font-semibold text-text-main'>
            Welcome back, {client?.name ?? client?.login}
          </h2>
          <p className='text-xs sm:text-sm text-text-muted mt-0.5'>
            Top up your SMS account credit seamlessly with M-Pesa.
          </p>
        </div>
      </div>

      <Card className='shadow-sm border-border-main/70 hover:border-border-main transition-colors'>
        <CardBody className='p-6 sm:p-8'>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className='space-y-5'>
            <Input
              label='Amount (KES)'
              placeholder='e.g. 500'
              inputMode='numeric'
              leftIcon={<Hash className='h-4 w-4 text-text-muted' />}
              error={errors.amount?.message}
              {...register('amount')}
            />
            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label='M-Pesa Phone Number'
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  hint="You'll receive the payment prompt on this number."
                  error={errors.phone?.message}
                />
              )}
            />
            <Button
              type='submit'
              fullWidth
              loading={mutation.isPending}
              className='py-3 hover:scale-[1.01] active:scale-[0.98] transition-transform'>
              Load Credit
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
