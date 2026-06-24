'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { handleClientError } from '@/lib/api';
import { ConsultationDto, ConsultationsResponse } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CalendarDays,
  Eye,
  FileText,
  FlaskConical,
  Loader2,
  Pill,
} from 'lucide-react';

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationDto[]>([]);
  const [pagination, setPagination] = useState<ConsultationsResponse['pagination'] | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadConsultations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ConsultationsResponse>('/consultations', {
        params: { page, limit: 10 },
      });
      setConsultations(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConsultations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConsultations]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Consultations Workspace
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Review completed consultations, prescriptions, and lab requests.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/doctor/appointments">
            <CalendarDays className="size-4" />
            Start From Appointment
          </Link>
        </Button>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-lg">Consultation Records</CardTitle>
          <CardDescription>Clinical records created from your appointments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching consultations...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <FileText className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Consultations Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Completed consultation records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Patient</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnosis</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Orders</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="py-4.5 pl-6">
                        <p className="font-bold text-foreground">{consultation.patientName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{consultation.patientPhoneNumber}</p>
                      </TableCell>
                      <TableCell className="py-4.5 font-semibold text-foreground">
                        {new Date(consultation.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="py-4.5 max-w-xs truncate">
                        {consultation.diagnosis || 'No diagnosis recorded'}
                      </TableCell>
                      <TableCell className="py-4.5">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Pill className="size-3" />
                            {consultation.prescriptions.reduce((total, prescription) => total + prescription.prescribedItems.length, 0)}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <FlaskConical className="size-3" />
                            {consultation.labRequests.length}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5 text-right pr-6">
                        <Button asChild>
                          <Link href={`/doctor/consultations/${consultation.id}/details`}>
                            <Eye className="size-3.5" />
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
