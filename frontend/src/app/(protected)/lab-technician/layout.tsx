'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { redirect, usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Microscope,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useLabTechnicianStore } from '@/store/lab-technician.store';
import { cn } from '@/lib/utils';
import { getUserDashboardPath } from '@/lib/role';

export default function LabTechnicianLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { labTechnician, fetchLabTechnician, status } = useLabTechnicianStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === 'labTechnician' && !labTechnician && status === 'idle') {
      fetchLabTechnician();
    }
  }, [user, labTechnician, status, fetchLabTechnician]);

  if (!user) {
    return null;
  }

  if (user.role !== 'labTechnician') {
    redirect(getUserDashboardPath(user.role));
  }

  const navItems = [
    { name: 'Dashboard', href: '/lab-technician', icon: LayoutDashboard },
    { name: 'Lab Requests', href: '/lab-technician/lab-requests', icon: ClipboardList },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex flex-col md:flex-row text-foreground">
      <header className="md:hidden flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 sm:px-6 sticky top-0 z-50">
        <Link href="/lab-technician" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
            <Microscope className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">NovaCare Laboratory</p>
            <p className="text-[10px] text-muted-foreground">Lab Technician Portal</p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-sm z-40 flex flex-col p-4 border-b border-border animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4 mt-auto">
            {labTechnician && (
              <div className="px-4 py-3 mb-4 rounded-xl bg-muted/40 border border-border flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {labTechnician.firstName} {labTechnician.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {labTechnician.qualification}
                </p>
              </div>
            )}
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full h-11 rounded-xl gap-2 justify-center"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card sticky top-0 h-screen p-5 shrink-0 z-30 justify-between">
        <div className="space-y-6">
          <Link href="/lab-technician" className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 text-primary shadow-sm">
              <Microscope className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">NovaCare Laboratory</p>
              <p className="text-[11px] text-muted-foreground font-medium">Lab Technician Workspace</p>
            </div>
          </Link>

          {labTechnician ? (
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Active Technician</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground truncate">
                  {labTechnician.firstName} {labTechnician.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {labTechnician.qualification}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[74px] rounded-2xl bg-muted/30 animate-pulse border border-border" />
          )}

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 text-primary">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Activity className="size-3.5 animate-pulse" />
              Lab Station Online
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:bg-primary/95'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full h-11 rounded-xl gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 justify-start px-4 transition-colors"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 w-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
