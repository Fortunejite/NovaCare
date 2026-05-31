'use client';

import { useAuthStore } from '@/store/auth.store';
import '@/lib/axios-interceptor';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};

export default Provider;
