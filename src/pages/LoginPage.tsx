import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { loginClient } from '../lib/api/auth';
import { useAuthStore } from '../stores/authStore';
import { ApiError } from '../lib/api';
import { Button } from '../ui/Button/Button';
import { Card, CardBody } from '../ui/Card/Card';
import { Input } from '../ui/Input/Input';
import { loginSchema, type LoginFormValues } from '../lib/schemas/authSchemas';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  useEffect(() => {
    if (expired) {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, [expired]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      loginClient(values.login, values.password),
    onSuccess: (data) => {
      setAuth(data.client, data.token);
      toast.success(`Welcome back, ${data.client.name ?? data.client.login}.`);
      navigate('/');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, { message: messages[0] });
          });
        } else {
          setError('login', { message: error.message });
        }
      } else {
        toast.error('Could not reach the server. Please try again.');
      }
    },
  });

  function onSubmit(values: LoginFormValues) {
    mutation.mutate(values);
  }

  return (
    <div className='min-h-screen bg-bg-base flex items-center justify-center p-6 selection:bg-navy-500 selection:text-white'>
      <div className='w-full max-w-md space-y-6 animate-page-in'>
        <div className='flex flex-col items-center text-center gap-3'>
          {/* Enhanced Crisp Logo Card Container */}
          <div className='px-6 py-4 sm:px-8 sm:py-5 rounded-2xl bg-bg-surface border border-border-main/80 shadow-sm hover:scale-102 transition-all flex items-center justify-center'>
            <img
              src='/ICORE_logo_last_iteration.svg'
              alt='ICORE Information Systems Ltd'
              className='w-52 sm:w-64 h-auto max-h-20 object-contain [image-rendering:-webkit-optimize-contrast]'
            />
          </div>
          <p className='text-xs sm:text-sm text-text-muted max-w-xs mt-1 font-medium'>
            Sign in to buy, top up, and manage your SMS credit
          </p>
        </div>

        <Card className='shadow-md border-border-main/80'>
          <CardBody className='p-6 sm:p-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Input
                label='Login'
                placeholder='Your login username'
                error={errors.login?.message}
                autoComplete='username'
                {...register('login')}
              />
              <Input
                label='Password'
                type='password'
                placeholder='••••••••'
                error={errors.password?.message}
                autoComplete='current-password'
                {...register('password')}
              />
              <Button
                type='submit'
                fullWidth
                loading={mutation.isPending}
                className='py-3 mt-2 hover:scale-[1.01] active:scale-[0.98] transition-transform'>
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className='text-xs text-text-muted text-center leading-relaxed'>
          Don't have login details? Contact ICORE to get set up.
        </p>
      </div>
    </div>
  );
}
