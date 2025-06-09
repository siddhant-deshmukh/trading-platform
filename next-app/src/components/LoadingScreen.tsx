'use client'

import { useAuth } from '@/context/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authLoading, setAuthLoading } = useAuth();
  // const [authLoading, setAuthLoading] = useState(false);
  const [prevPath, setPrevPath] = useState('');

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();

    if (prevPath && prevPath !== currentPath) {
      setAuthLoading(true);
      // Set a minimum authLoading time to show the spinner
      const timer = setTimeout(() => {
        setAuthLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }

    setPrevPath(currentPath);
    setAuthLoading(false);
  }, [pathname, searchParams, prevPath]);

  if (!authLoading) return null;

  return (
    <div className="fixed inset-0 w-full flex flex-col h-screen z-50">
      <div className='mt-12 bg-white/ h-full backdrop-blur-lg'>
        <div className='h-full flex items-center justify-center z-50'>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
