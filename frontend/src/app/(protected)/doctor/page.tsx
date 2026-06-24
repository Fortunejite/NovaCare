'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { DoctorSummaryDto } from '@app/shared';
import { useDoctorStore } from '@/store/doctor.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  ClipboardPlus,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

export default function DoctorDashboard() {
  const { doctor } = useDoctorStore();
  const [summary, setSummary] = useState<DoctorSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<DoctorSummaryDto>('/summary/doctor');
      setSummary(res.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSummary]);

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
            {getGreeting()}, Dr {doctor ? doctor.firstName : 'Doctor'}
            <Sparkles className="size-6 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is your clinical schedule overview for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary border border-primary/10">
          <Activity className="size-4 animate-pulse" />
          Doctor Active Station
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                  <CalendarDays className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.todayScheduledAppointments ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Scheduled Today</p>
                <p className="text-xs text-muted-foreground mt-0.5">Appointments on your clinical queue</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                  <CalendarCheck2 className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.todayCompletedAppointments ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Completed Today</p>
                <p className="text-xs text-muted-foreground mt-0.5">Consultations closed for today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-lg">Quick Actions & Shortcuts</CardTitle>
          <CardDescription>Manage appointments and create consultations.</CardDescription>
        </CardHeader>
        <CardContent className="py-6 grid gap-4 sm:grid-cols-2">
          <Link href="/doctor/appointments" className="group">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary group-hover:text-white transition-colors">
                  <CalendarDays className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Appointments</p>
                  <p className="text-sm text-muted-foreground">Review patient schedule and visit status</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/doctor/consultations" className="group">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ClipboardPlus className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">Create Consultation</p>
                  <p className="text-sm text-muted-foreground">Diagnose, prescribe, and request lab tests</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </CardContent>
      </Card>

      {doctor && (
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">{doctor.departmentName}</p>
                <p className="text-sm text-muted-foreground">
                  {doctor.yearsOfExperience} years experience · Consultation fee: {doctor.consultationFee}
                </p>
              </div>
            </div>
            <p className="text-xs font-mono text-muted-foreground">Lic: {doctor.licenseNumber}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
