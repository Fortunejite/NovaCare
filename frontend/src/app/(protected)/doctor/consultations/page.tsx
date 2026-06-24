'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { DoctorAppointmentDto, DoctorAppointmentsResponse } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardPlus,
  Loader2,
  Stethoscope,
} from 'lucide-react';

export default function DoctorConsultationsPage() {
  const [appointments, setAppointments] = useState<DoctorAppointmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<DoctorAppointmentsResponse>('/appointments', {
        params: { page: 1, limit: 20 },
      });
      setAppointments(res.data.data.filter((appointment) => appointment.status === 'scheduled'));
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Consultations Workspace
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Select a scheduled appointment to create a consultation.
        </p>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-lg">Ready For Consultation</CardTitle>
          <CardDescription>Scheduled appointments that can be converted into clinical notes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching scheduled appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Scheduled Consultations</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Your scheduled appointment queue is currently empty.
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-lg">
                <Link href="/doctor/appointments">
                  <CalendarDays className="size-4" />
                  View Appointments
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((appointment) => {
                const visitTime = new Date(appointment.datetime).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });

                return (
                  <div key={appointment.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                        <Stethoscope className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground">{appointment.patientName}</p>
                          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 text-xs font-normal">
                            Scheduled
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{visitTime}</p>
                        <p className="text-sm text-foreground mt-1">{appointment.reason}</p>
                      </div>
                    </div>
                    <Button asChild className="rounded-lg">
                      <Link href={`/doctor/consultations/${appointment.id}`}>
                        <ClipboardPlus className="size-4" />
                        Create Consultation
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
