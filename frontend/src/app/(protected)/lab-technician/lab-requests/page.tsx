'use client';

import { useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianLabRequestDto, LabTechnicianLabRequestResponse } from '@app/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

export default function LabRequestsList() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<LabTechnicianLabRequestDto[]>([]);
  const [pagination, setPagination] = useState<LabTechnicianLabRequestResponse['pagination'] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const fetch = async () => {
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
  };

  useEffect(() => {
    fetch();
  }, [page, status]);

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const patient = r.patientName?.toLowerCase() || '';
    return patient.includes(q) || r.testType.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold">Lab Requests</h2>
        <p className="text-muted-foreground">View and process lab requests.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all','pending','completed'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 rounded ${status===s? 'bg-muted text-foreground':'text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search patient or test" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && requests.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto"/></div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No lab requests found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link href={`/lab-technician/lab-requests/${r.id}`} className="font-semibold hover:underline">{r.patientName || 'Unknown'}</Link>
                      <div className="text-xs text-muted-foreground">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>{r.testType}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/lab-technician/lab-requests/${r.id}`} className="btn">Open</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
