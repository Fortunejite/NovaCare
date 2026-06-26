'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { redirect } from 'next/navigation';
import { getUserDashboardPath } from '@/lib/role';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  if (user.role !== 'receptionist') {
    redirect(getUserDashboardPath(user.role));
  }
  
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
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
