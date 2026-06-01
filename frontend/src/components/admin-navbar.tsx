import Link from 'next/link';
import { Hospital } from 'lucide-react';

export default function AdminNavbar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto h-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex h-full items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-primary">
            <Hospital className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">NovaCare admin portal</p>
            <p className="text-xs text-muted-foreground">Hospital operations dashboard</p>
          </div>
        </Link>
      </div>
    </header>
  );
}