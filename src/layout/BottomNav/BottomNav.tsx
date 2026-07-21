import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { navTabs } from '../navTabs';

export function BottomNav() {
  return (
    <nav
      className='lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-surface border-t border-border-main flex items-stretch'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
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
