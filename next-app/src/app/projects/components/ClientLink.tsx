// components/ClientLink.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ClientLinkProps {
  href: string;
  children: React.ReactNode;
}

export const ClientLink: React.FC<ClientLinkProps> = ({ href, children }) => {
  const router = useRouter();

  const { authLoading, setAuthLoading } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    router.push(href);
  };

  return (
    <>
      <a href={href} onClick={handleClick}>
        {children}
      </a>
    </>
  );
};
