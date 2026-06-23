'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianLabRequestDto } from '@app/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Loader2,
  Send,
  Stethoscope,
  UserRound,
} from 'lucide-react';

export default function LabRequestDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<LabTechnicianLabRequestDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [resultText, setResultText] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<LabTechnicianLabRequestDto>(`/lab-requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const generate = async () => {
    try {
      await api.post(`/lab-requests/${id}/result`, { result: resultText });
      setOpenConfirm(false);
      router.push('/lab-technician/lab-requests');
    } catch (err) {
      handleClientError(err);
    }
  };

  const getStatusBadge = (requestStatus?: LabTechnicianLabRequestDto['status']) => {
    switch (requestStatus) {
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 gap-1 text-xs font-normal">
            <Clock className="size-3" />
            Pending
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 gap-1 text-xs font-normal">
            <CheckCircle2 className="size-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{requestStatus ?? 'Unknown'}</Badge>;
    }
  };

  const requestedDate = request
    ? new Date(request.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  if (!request && loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading lab request...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
          <ClipboardList className="size-6" />
        </div>
        <h3 className="font-bold text-foreground text-base">Lab Request Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This request may have been moved or removed from the queue.
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
            Lab Request Details
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Review the request and generate a patient lab result.
          </p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <CardTitle className="text-lg">Request Summary</CardTitle>
            <CardDescription>Patient, doctor, and test information.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Patient</p>
                <p className="font-bold text-foreground truncate">{request.patientName || 'Unknown Patient'}</p>
                <p className="text-xs text-muted-foreground">{request.patientPhone || 'No phone number'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/10">
                <Stethoscope className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Requesting Doctor</p>
                <p className="font-bold text-foreground truncate">Dr {request.doctorName}</p>
                <p className="text-xs text-muted-foreground">Consultation: {new Date(request.consultationDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/10">
                <FlaskConical className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Test Type</p>
                <p className="font-bold text-foreground truncate">{request.testType}</p>
                <p className="text-xs text-muted-foreground">Requested: {requestedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Result Workspace</CardTitle>
                <CardDescription>Enter the verified laboratory findings.</CardDescription>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <FileText className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {request.result && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 mb-2">
                    Saved Result
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{request.result}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Result Notes</label>
                <Textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Enter result details, observations, and measured values here..."
                  className="min-h-48 rounded-xl border-border resize-y"
                  disabled={request.status === 'completed'}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {request.status !== 'completed' && (
                  <Button
                    onClick={() => setOpenConfirm(true)}
                    disabled={!resultText.trim()}
                    className="h-10 rounded-lg gap-2"
                  >
                    <Send className="size-4" />
                    Generate Result
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.back()} className="h-10 rounded-lg gap-2">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={openConfirm}
        title="Generate lab result"
        description="This will mark the request as completed and save the result. Proceed?"
        confirmLabel="Generate"
        cancelLabel="Cancel"
        onConfirm={generate}
        onCancel={() => setOpenConfirm(false)}
      />
    </div>
  );
}
