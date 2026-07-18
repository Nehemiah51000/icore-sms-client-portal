import { NavLink } from 'react-router-dom';
import { Home, History, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      className='fixed bottom-0 inset-x-0 z-40 bg-bg-surface border-t border-border-main flex items-stretch'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'text-navy-500' : 'text-text-muted',
            )
          }>
          <tab.icon className='h-5 w-5' />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
