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
    <div className='min-h-screen bg-bg-base flex items-center justify-center p-6'>
      <div className='w-full max-w-xs'>
        <div className='flex flex-col items-center gap-2 mb-8'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-14 w-14 rounded-2xl'
          />
          <h1 className='text-lg font-semibold text-text-main mt-2'>
            ICORE SMS
          </h1>
          <p className='text-xs text-text-muted text-center'>
            Sign in to buy and manage your SMS credit
          </p>
        </div>

        <Card>
          <CardBody>
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
              <Button type='submit' fullWidth loading={mutation.isPending}>
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className='text-xs text-text-muted text-center mt-6'>
          Don't have login details? Contact ICORE to get set up.
        </p>
      </div>
    </div>
  );
}
