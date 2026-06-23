'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianLabRequestDto, LabTechnicianLabRequestResponse } from '@app/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FlaskConical,
  Loader2,
  Search,
} from 'lucide-react';

export default function LabRequestsList() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<LabTechnicianLabRequestDto[]>([]);
  const [pagination, setPagination] = useState<LabTechnicianLabRequestResponse['pagination'] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<LabTechnicianLabRequestResponse>('/lab-requests', {
        params: { page, limit: 10, status: status !== 'all' ? status : undefined },
      });
      setRequests(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetch]);

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const patient = r.patientName?.toLowerCase() || '';
    return patient.includes(q) || r.testType.toLowerCase().includes(q);
  });

  const getStatusBadge = (requestStatus: LabTechnicianLabRequestDto['status']) => {
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
        return <Badge variant="outline">{requestStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Lab Requests Workspace
        </h1>
        <p className="text-muted-foreground mt-0.5">
          View, filter, and process laboratory requests from doctors.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-5 px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border self-start">
              {(['all', 'pending', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${status === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 rounded-xl pl-9 border-border"
                placeholder="Search patient or test..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching lab requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <ClipboardList className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Lab Requests Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {search || status !== 'all'
                  ? 'Try resetting filters or checking search spellings.'
                  : 'The laboratory queue is currently empty.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Patient</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Test Type</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const requestedDate = new Date(r.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <TableRow key={r.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4.5 pl-6">
                          <div>
                            <Link href={`/lab-technician/lab-requests/${r.id}`} className="font-bold text-foreground hover:underline">
                              {r.patientName || 'Unknown Patient'}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">Requested: {requestedDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4.5 font-semibold text-foreground">
                          Dr {r.doctorName}
                        </TableCell>
                        <TableCell className="py-4.5">
                          <div className="inline-flex items-center gap-2 text-sm font-medium">
                            <FlaskConical className="size-4 text-primary" />
                            {r.testType}
                          </div>
                        </TableCell>
                        <TableCell className="py-4.5">
                          {getStatusBadge(r.status)}
                        </TableCell>
                        <TableCell className="py-4.5 text-right pr-6">
                          <Button asChild>
                            <Link href={`/lab-technician/lab-requests/${r.id}`}>
                              <Eye className="size-3.5" />
                              See Details
                            </Link>
                          </Button>
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
