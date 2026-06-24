'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { DoctorAppointmentDto, DoctorSummaryDto } from '@app/shared';
import { useDoctorStore } from '@/store/doctor.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  ClipboardPlus,
  FlaskConical,
  Loader2,
  Pill,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

export default function DoctorDashboard() {
  const { doctor } = useDoctorStore();
  const [summary, setSummary] = useState<DoctorSummaryDto | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<DoctorAppointmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryResponse, appointmentsResponse] = await Promise.all([
        api.get<DoctorSummaryDto>('/summary/doctor'),
        api.get<DoctorAppointmentDto[]>('/appointments/today'),
      ]);
      setSummary(summaryResponse.data);
      setTodayAppointments(appointmentsResponse.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

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
                  <CalendarDays className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.todayScheduledAppointments ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Appointments Today</p>
                <p className="text-xs text-muted-foreground mt-0.5">All visits on today&apos;s schedule</p>
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

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/10">
                  <ClipboardPlus className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.todayPendingAppointments ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Today</p>
                <p className="text-xs text-muted-foreground mt-0.5">Scheduled visits still open</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/10">
                  <Stethoscope className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalConsultations ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Total Consultations</p>
                <p className="text-xs text-muted-foreground mt-0.5">Consultation records created</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 border border-violet-500/10">
                  <FlaskConical className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.pendingLabRequests ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Labs</p>
                <p className="text-xs text-muted-foreground mt-0.5">Requested tests awaiting result</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/10">
                  <Pill className="size-5" />
                </div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.pendingPrescriptions ?? 0}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Prescriptions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pharmacy items awaiting dispense</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Today&apos;s Appointments</CardTitle>
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/doctor/appointments">
                See More
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching today&apos;s appointments...</p>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <CalendarDays className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Appointments Today</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Your schedule is clear for today.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Patient</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <TableRow key={appointment.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <TableCell className="py-4.5 pl-6 font-bold text-foreground">{appointment.patientName}</TableCell>
                    <TableCell className="py-4.5">
                      {new Date(appointment.datetime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="py-4.5 max-w-xs truncate">{appointment.reason}</TableCell>
                    <TableCell className="py-4.5">
                      <Badge variant="outline" className="capitalize">{appointment.status}</Badge>
                    </TableCell>
                    <TableCell className="py-4.5 text-right pr-6">
                      {appointment.status === 'scheduled' ? (
                        <Button asChild>
                          <Link href={`/doctor/appointments/${appointment.id}`}>
                            <ClipboardPlus className="size-3.5" />
                            Start
                          </Link>
                        </Button>
                      ) : appointment.consultationId ? (
                        <Button asChild variant="outline">
                          <Link href={`/doctor/consultations/${appointment.consultationId}/details`}>
                            View
                          </Link>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
