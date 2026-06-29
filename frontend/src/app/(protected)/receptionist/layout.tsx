'use client';

import Link from 'next/link';
import { ClipboardList, LogOut, User, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { redirect, useRouter } from 'next/navigation';
import { getUserDashboardPath } from '@/lib/role';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return null;
  }

  if (user.role !== 'receptionist') {
    redirect(getUserDashboardPath(user.role));
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/receptionist" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-primary">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">NovaCare receptionist portal</p>
              <p className="text-xs text-muted-foreground">Patient intake and front desk</p>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className='flex gap-2 items-center'>
              <UserCircle className='size-4' />
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <LogOut className='size-4 cursor-pointer' onClick={handleLogout} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
