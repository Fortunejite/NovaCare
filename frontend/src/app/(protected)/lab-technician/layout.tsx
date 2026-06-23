import React from 'react';
import Link from 'next/link';

export const metadata = { title: 'Lab Technician' };

export default function LabTechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lab Technician Workspace</h1>
            <p className="text-sm text-muted-foreground">Manage lab requests and generate results.</p>
          </div>
          <nav className="flex gap-3">
            <Link className="btn" href="/lab-technician">Dashboard</Link>
            <Link className="btn" href="/lab-technician/lab-requests">Lab Requests</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
