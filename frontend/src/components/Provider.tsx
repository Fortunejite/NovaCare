'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';

const Provider = ({ children }: { children: React.ReactNode }) => {

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};

export default Provider;
