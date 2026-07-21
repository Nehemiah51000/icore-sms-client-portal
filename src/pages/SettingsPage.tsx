import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut, User, Lock } from 'lucide-react';
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
        label='Login Handle'
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        error={error}
      />
      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        fullWidth
        className='hover:scale-[1.01] active:scale-[0.98] transition-transform'>
        Save Username
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
        fullWidth
        className='hover:scale-[1.01] active:scale-[0.98] transition-transform'>
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
    <div className='max-w-xl mx-auto space-y-6'>
      <Card className='shadow-xs border-border-main/70'>
        <CardHeader className='flex items-center gap-2 border-b border-border-main/60 px-5 py-4'>
          <User className='h-4 w-4 text-text-main' />
          <span className='text-sm font-bold text-text-main'>
            Login Profile
          </span>
        </CardHeader>
        <CardBody className='p-5'>
          {isLoading || !data ? (
            <div className='h-12 rounded-xl bg-bg-base animate-pulse' />
          ) : (
            <LoginForm key={data.id} initial={data} />
          )}
        </CardBody>
      </Card>

      <Card className='shadow-xs border-border-main/70'>
        <CardHeader className='flex items-center gap-2 border-b border-border-main/60 px-5 py-4'>
          <Lock className='h-4 w-4 text-text-main' />
          <span className='text-sm font-bold text-text-main'>
            Security & Password
          </span>
        </CardHeader>
        <CardBody className='p-5'>
          <PasswordForm />
        </CardBody>
      </Card>

      <Button
        variant='secondary'
        fullWidth
        onClick={handleLogout}
        className='py-3 border-red-500/20 text-red-600 hover:bg-red-500/10 active:scale-[0.98] transition-all'>
        <LogOut className='h-4 w-4 mr-2' /> Log Out
      </Button>
    </div>
  );
}
