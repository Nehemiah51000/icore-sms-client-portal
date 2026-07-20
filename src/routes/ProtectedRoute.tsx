import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getProfile } from '../lib/api/profile';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const client = useAuthStore((s) => s.client);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [hydrating, setHydrating] = useState(Boolean(token) && !client);

  useEffect(() => {
    if (!token || client) return;

    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (!cancelled) setAuth(profile, token);
      })
      .catch(() => {
        // A genuine 401 is already handled globally by api.ts.
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return <Navigate to='/login' replace />;

  if (hydrating) {
    return (
      <div className='min-h-screen bg-bg-base flex items-center justify-center'>
        <div className='h-8 w-8 rounded-full border-2 border-navy-500 border-t-transparent animate-spin' />
      </div>
    );
  }

  return <Outlet />;
}
