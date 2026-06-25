'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { ConsultationDto } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Loader2,
  Pill,
  UserRound,
} from 'lucide-react';

const formatLabTest = (test: string) => {
  return test
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ConsultationDetailsPage() {
  const params = useParams();
  const consultationId = params?.consultationId as string;
  const router = useRouter();
  const [consultation, setConsultation] = useState<ConsultationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConsultation = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ConsultationDto>(`/consultations/${consultationId}`);
      setConsultation(res.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConsultation();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConsultation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading consultation details...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
          <FileText className="size-6" />
        </div>
        <h3 className="font-bold text-foreground text-base">Consultation Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This consultation could not be loaded.
        </p>
        <Button variant="outline" onClick={() => router.back()} className="mt-5 rounded-lg">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Consultation Details
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Completed on {new Date(consultation.completedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {consultation.appointmentStatus === 'progress' && (
            <Button asChild className="rounded-lg">
              <Link href={`/doctor/consultations/${consultation.id}/edit`}>
                Edit Consultation
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()} className="rounded-lg">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <CardTitle className="text-lg">Patient Summary</CardTitle>
            <CardDescription>Consultation owner and appointment context.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Patient</p>
                <p className="font-bold text-foreground truncate">{consultation.patientName}</p>
                <p className="text-xs text-muted-foreground">{consultation.patientPhoneNumber}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Appointment Status</p>
              <Badge variant="outline" className="mt-2 capitalize">
                {consultation.appointmentStatus === 'progress' ? 'in progress' : consultation.appointmentStatus}
              </Badge>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Diagnosis</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {consultation.diagnosis || 'No diagnosis recorded'}
              </p>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Notes</p>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                {consultation.notes || 'No notes recorded'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg">Prescriptions</CardTitle>
              <CardDescription>Medication orders and pharmacy processing status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {consultation.prescriptions.length === 0 ? (
                <div className="p-8 text-sm text-muted-foreground text-center">No prescriptions were added.</div>
              ) : (
                <div className="divide-y divide-border">
                  {consultation.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-5 space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="size-4 text-primary" />
                          <p className="font-bold text-foreground">Prescription</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">{prescription.status}</Badge>
                          <Badge variant="outline">Pharmacist: {prescription.pharmacistId || 'Pending'}</Badge>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {prescription.prescribedItems.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-border p-4">
                            <p className="font-semibold text-foreground">{item.medicationName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.dosage} / {item.frequency} / {item.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">Lab Requests</CardTitle>
                  <CardDescription>Requested tests, assigned technician, and result state.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {consultation.labRequests.length === 0 ? (
                <div className="p-8 text-sm text-muted-foreground text-center">No lab requests were added.</div>
              ) : (
                <div className="divide-y divide-border">
                  {consultation.labRequests.map((request) => (
                    <div key={request.id} className="p-5 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="size-4 text-primary" />
                          <p className="font-bold text-foreground">{formatLabTest(request.testType)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={request.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 gap-1 text-xs font-normal'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 gap-1 text-xs font-normal'}
                          >
                            {request.status === 'completed' ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                            {request.status}
                          </Badge>
                          <Badge variant="outline">Technician: {request.labTechnicianId || 'Unassigned'}</Badge>
                        </div>
                      </div>
                      {request.labTechnicianName && (
                        <p className="text-xs text-muted-foreground">Handled by {request.labTechnicianName}</p>
                      )}
                      {request.result ? (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 mb-2">
                            Result
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{request.result}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClipboardList className="size-4" />
                          Awaiting lab result
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
