'use client';

import AdminNavbar from '@/components/admin-navbar';
import { getUserDashboardPath } from '@/lib/role';
import { useAuthStore } from '@/store/auth.store';
import { redirect } from 'next/navigation';

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
    redirect(getUserDashboardPath(user.role));
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
