'use client'

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState('');

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    
    if (prevPath && prevPath !== currentPath) {
      setLoading(true);
      // Set a minimum loading time to show the spinner
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    setPrevPath(currentPath);
    setLoading(false);
  }, [pathname, searchParams, prevPath]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 w-full h-full flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
