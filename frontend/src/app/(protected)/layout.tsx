'use client';

import LoadingPage from '@/components/loading-page';
import { useAuthStore } from '@/store/auth.store';
import { redirect, usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuthStore();
  const pathname = usePathname();

  if (status === 'loading') {
    return <LoadingPage />;
  } else if (status === 'unauthenticated') {
    redirect(`/login?next=${pathname}`);
  }

  return <>{children}</>;
}
