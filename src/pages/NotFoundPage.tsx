import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button } from '../ui/Button/Button';

export function NotFoundPage() {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center'>
      <div className='h-16 w-16 rounded-2xl bg-navy-500/10 text-navy-500 flex items-center justify-center mb-5'>
        <SearchX className='h-8 w-8' />
      </div>
      <h1 className='text-lg font-bold text-text-main mb-1'>Page not found</h1>
      <p className='text-sm text-text-muted mb-6 max-w-xs'>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to='/'>
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
