import { type ReactNode } from 'react';
import { BottomNav } from '../BottomNav/BottomNav';
import { DesktopTabs } from '../DesktopTabs/DesktopTabs';
import { ThemeToggle } from '../../ui/ThemeToggle/ThemeToggle';
import { NotificationBell } from '../../ui/NotificationBell/NotificationBell';
import { UserMenu } from '../../ui/UserMenu/UserMenu';

interface ClientShellProps {
  title?: string;
  children: ReactNode;
}

export function ClientShell({ title, children }: ClientShellProps) {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col text-text-main selection:bg-navy-500 selection:text-white'>
      <header className='sticky top-0 z-30 bg-bg-surface/85 backdrop-blur-md border-b border-border-main transition-all'>
        <div className='h-16 flex items-center justify-between gap-4 px-4 lg:px-8 max-w-5xl mx-auto w-full'>
          <div className='flex items-center gap-3 shrink-0'>
            <div className='p-1 rounded-lg bg-bg-base border border-border-main/60 shadow-xs hover:scale-105 active:scale-95 transition-transform'>
              <img
                src='/ic_frame_2.svg'
                alt='ICORE'
                className='h-6 w-6 rounded-md shrink-0 object-contain'
              />
            </div>
            <h1 className='text-sm sm:text-base font-semibold text-text-main truncate tracking-tight'>
              {title ?? 'ICORE SMS'}
            </h1>
          </div>

          <DesktopTabs />

          <div className='flex items-center gap-2 shrink-0'>
            <ThemeToggle />
            <NotificationBell />
            <div className='h-4 w-px bg-border-main mx-1' />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className='flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10 max-w-5xl mx-auto w-full animate-page-in'>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
