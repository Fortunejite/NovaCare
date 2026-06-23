'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianSummaryDto } from '@app/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLabTechnicianStore } from '@/store/lab-technician.store';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Microscope,
  Sparkles,
  Timer,
} from 'lucide-react';

export default function LabTechnicianDashboard() {
  const { labTechnician } = useLabTechnicianStore();
  const [summary, setSummary] = useState<LabTechnicianSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<LabTechnicianSummaryDto>('/summary/lab-technician');
      setSummary(res.data);
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            {getGreeting()}, {labTechnician ? labTechnician.firstName : 'Technician'}
            <Sparkles className="size-6 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is your laboratory workload overview for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary border border-primary/10">
          <Activity className="size-4 animate-pulse" />
          Lab Technician Active Station
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                  <FlaskConical className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalLabRequests ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Total Lab Requests</p>
                <p className="text-xs text-muted-foreground mt-0.5">All laboratory request records</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalCompletedByMe ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Completed By Me</p>
                <p className="text-xs text-muted-foreground mt-0.5">Results generated under your profile</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/10">
                  <Timer className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalPendingAssignedToMe ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Assigned</p>
                <p className="text-xs text-muted-foreground mt-0.5">Requests waiting on your desk</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/10">
                  <ClipboardList className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalPendingUnassigned ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Unassigned</p>
                <p className="text-xs text-muted-foreground mt-0.5">Open requests in the lab queue</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-lg">Quick Actions & Shortcuts</CardTitle>
          <CardDescription>Common lab technician operations and tasks.</CardDescription>
        </CardHeader>
        <CardContent className="py-6 grid gap-4 sm:grid-cols-2">
          <Link href="/lab-technician/lab-requests" className="group">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Microscope className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">Process Lab Requests</p>
                  <p className="text-sm text-muted-foreground">Review pending tests and submit patient results</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
