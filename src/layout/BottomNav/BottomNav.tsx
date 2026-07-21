import { NavLink } from 'react-router-dom';
import { navTabs } from '../navTabs';
import { cn } from '../../lib/cn';

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
          className='flex-1 flex items-center justify-center py-2'>
          {({ isActive }) => (
            <div
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
                isActive ? 'bg-navy-500 text-white' : 'text-text-muted',
              )}>
              <tab.icon className='h-5 w-5' />
              <span className='text-[11px] font-medium'>{tab.label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
