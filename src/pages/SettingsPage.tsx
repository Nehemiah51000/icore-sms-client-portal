import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { getProfile, updateProfile, updatePassword } from '../lib/api/profile';
import { ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';

interface ClientAccount {
  id: number;
  name: string | null;
  login: string;
  phone: string;
  provider_id: number;
}

function LoginForm({ initial }: { initial: ClientAccount }) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [login, setLogin] = useState(initial.login);
  const [error, setError] = useState<string>();

  const mutation = useMutation({
    mutationFn: () => updateProfile({ login }),
    onSuccess: (client) => {
      if (token) setAuth(client, token);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Login updated.');
      setError(undefined);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors) {
        setError(err.errors.login?.[0]);
      } else {
        toast.error(
          err instanceof ApiError ? err.message : 'Could not update login.',
        );
      }
    },
  });

  return (
    <div className='space-y-4'>
      <Input
        label='Login'
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        error={error}
      />
      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        fullWidth>
        Save Login
      </Button>
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      }),
    onSuccess: () => {
      toast.success('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        const flat: Record<string, string> = {};
        Object.entries(error.errors).forEach(([f, m]) => (flat[f] = m[0]));
        setErrors(flat);
      } else {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Could not update password.',
        );
      }
    },
  });

  return (
    <div className='space-y-4'>
      <Input
        label='Current Password'
        type='password'
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.current_password}
      />
      <Input
        label='New Password'
        type='password'
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.new_password}
      />
      <Input
        label='Confirm New Password'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        fullWidth>
        Update Password
      </Button>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    meta: { silent: true },
  });

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (isError) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <span className='text-sm font-semibold text-text-main'>Login</span>
        </CardHeader>
        <CardBody>
          {isLoading || !data ? (
            <div className='h-10 rounded bg-bg-base animate-pulse' />
          ) : (
            <LoginForm key={data.id} initial={data} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className='text-sm font-semibold text-text-main'>Password</span>
        </CardHeader>
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>

      <Button variant='secondary' fullWidth onClick={handleLogout}>
        <LogOut className='h-4 w-4' /> Log Out
      </Button>
    </div>
  );
}
