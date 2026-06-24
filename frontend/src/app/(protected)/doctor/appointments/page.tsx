'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { DoctorAppointmentDto, DoctorAppointmentsResponse } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardPlus,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react';

type AppointmentStatus = DoctorAppointmentDto['status'];

export default function DoctorAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<DoctorAppointmentDto[]>([]);
  const [pagination, setPagination] = useState<DoctorAppointmentsResponse['pagination'] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AppointmentStatus>('all');

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<DoctorAppointmentsResponse>('/appointments', {
        params: { page, limit: 10 },
      });
      setAppointments(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAppointments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAppointments]);

  const filtered = appointments.filter((appointment) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || appointment.patientName.toLowerCase().includes(query) || appointment.reason.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || appointment.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (appointmentStatus: AppointmentStatus) => {
    switch (appointmentStatus) {
      case 'scheduled':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 gap-1 text-xs font-normal">
            <Clock className="size-3" />
            Scheduled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 gap-1 text-xs font-normal">
            <CheckCircle2 className="size-3" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/15 gap-1 text-xs font-normal">
            <XCircle className="size-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{appointmentStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Appointments Workspace
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Manage scheduled visits and start patient consultations.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-5 px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border self-start">
              {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setStatus(item);
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${status === item ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 rounded-xl pl-9 border-border"
                placeholder="Search patient or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching appointments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <CalendarDays className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Appointments Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {search || status !== 'all'
                  ? 'Try resetting filters or checking search spellings.'
                  : 'Your appointment queue is currently empty.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Patient</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visit Time</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((appointment) => {
                    const visitTime = new Date(appointment.datetime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <TableRow key={appointment.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4.5 pl-6">
                          <div>
                            <p className="font-bold text-foreground">{appointment.patientName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Booked: {new Date(appointment.createdAt).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4.5 font-semibold text-foreground">{visitTime}</TableCell>
                        <TableCell className="py-4.5 max-w-xs truncate">{appointment.reason}</TableCell>
                        <TableCell className="py-4.5">{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="py-4.5 text-right pr-6">
                          {appointment.status === 'scheduled' ? (
                            <Button asChild>
                              <Link href={`/doctor/consultations/${appointment.id}`}>
                                <ClipboardPlus className="size-3.5" />
                                Start Consultation
                              </Link>
                            </Button>
                          ) : (
                            <Button disabled>
                              <ClipboardPlus className="size-3.5" />
                              Start Consultation
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pagination && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={!pagination.hasPreviousPage || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={!pagination.hasNextPage || isLoading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
