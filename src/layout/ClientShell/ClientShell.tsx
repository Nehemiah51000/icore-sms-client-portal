import { type ReactNode } from 'react';
import { BottomNav } from '../BottomNav/BottomNav';

interface ClientShellProps {
  title?: string;
  children: ReactNode;
}

export function ClientShell({ title, children }: ClientShellProps) {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col'>
      <header className='sticky top-0 z-30 h-14 flex items-center gap-2 px-4 bg-bg-surface border-b border-border-main'>
        <img src='/ic_frame_2.svg' alt='ICORE' className='h-7 w-7 rounded-md' />
        <h1 className='text-sm font-semibold text-text-main'>
          {title ?? 'ICORE SMS'}
        </h1>
      </header>

      <main className='flex-1 px-4 py-4 pb-24 animate-page-in'>{children}</main>

      <BottomNav />
    </div>
  );
}
