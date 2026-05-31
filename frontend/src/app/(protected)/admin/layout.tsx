'use client';

import { useAuthStore } from '@/store/auth.store';
import { redirect, useParams } from 'next/navigation';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    redirect('/');
  }
  
  return <>{children}</>;
}
