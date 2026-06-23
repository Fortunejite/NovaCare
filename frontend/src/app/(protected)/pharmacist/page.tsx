'use client';

import { usePharmacistStore } from '@/store/pharmacist.store';
import { useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { PharmacistSummaryDto } from '@app/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Pill, ClipboardList, AlertTriangle, CheckCircle, ArrowRight, Activity } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function PharmacistDashboard() {
  const { pharmacist } = usePharmacistStore();
  const [summary, setSummary] = useState<PharmacistSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<PharmacistSummaryDto>('/summary/pharmacist');
        setSummary(res.data);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            {getGreeting()}, {pharmacist ? pharmacist.firstName : 'Pharmacist'}
            <Sparkles className="size-6 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is your pharmacy overview for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary border border-primary/10">
          <Activity className="size-4 animate-pulse" />
          Pharmacist Active Station
        </div>
      </div>

      {/* Insights Cards */}
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
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/10">
                  <ClipboardList className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalPendingPrescriptions ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Prescriptions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Awaiting dispensing</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                  <CheckCircle className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalDispensedByMe ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Dispensed By Me</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total processed prescriptions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                  <Pill className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalMedications ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Medications Registered</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active medication directory</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/10">
                  <AlertTriangle className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.outOfStockMedications ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Out of Stock</p>
                <p className="text-xs text-muted-foreground mt-0.5">Needs stock replenishment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Action Button section */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-lg">Quick Actions & Shortcuts</CardTitle>
          <CardDescription>Common pharmacist operations and tasks.</CardDescription>
        </CardHeader>
        <CardContent className="py-6 grid gap-4 sm:grid-cols-2">
          <Link href="/pharmacist/prescriptions" className="group">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/15 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ClipboardList className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">Dispense Prescriptions</p>
                  <p className="text-sm text-muted-foreground">Review patient prescriptions and dispense medication</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/pharmacist/medications" className="group">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Pill className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Stock</p>
                  <p className="text-sm text-muted-foreground">Add new medications or update inventory levels</p>
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
