import { NavLink } from 'react-router-dom';
import { navTabs } from '../navTabs';
import { cn } from '../../lib/cn';

export function DesktopTabs() {
  return (
    <nav className='hidden lg:flex items-center gap-1'>
      {navTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-navy-500 text-white'
                : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover',
            )
          }>
          <tab.icon className='h-4 w-4' />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
