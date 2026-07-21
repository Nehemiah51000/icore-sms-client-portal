import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '../BottomNav/BottomNav';
import { ThemeToggle } from '../../ui/ThemeToggle/ThemeToggle';
import { NotificationBell } from '../../ui/NotificationBell/NotificationBell';
import { useAuthStore } from '../../stores/authStore';

interface ClientShellProps {
  title?: string;
  children: ReactNode;
}

export function ClientShell({ title, children }: ClientShellProps) {
  const client = useAuthStore((s) => s.client);

  const initials = client?.name
    ? client.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (client?.login?.slice(0, 2).toUpperCase() ?? '?');

  return (
    <div className='min-h-screen bg-bg-base flex flex-col'>
      <header className='sticky top-0 z-30 h-14 flex items-center justify-between gap-2 px-4 bg-bg-surface border-b border-border-main'>
        <div className='flex items-center gap-2 min-w-0'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-7 w-7 rounded-md shrink-0'
          />
          <h1 className='text-sm font-semibold text-text-main truncate'>
            {title ?? 'ICORE SMS'}
          </h1>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <ThemeToggle />
          <NotificationBell />
          <Link
            to='/settings'
            className='h-8 w-8 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-semibold ml-1'
            aria-label='Account'>
            {initials}
          </Link>
        </div>
      </header>

      <main className='flex-1 px-4 py-4 pb-24 animate-page-in'>{children}</main>

      <BottomNav />
    </div>
  );
}
