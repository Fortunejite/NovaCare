'use client';

import { useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { PharmacistPrescriptionDto, PrescriptionPharmacistListItem, PrescriptionsListResponse } from '@app/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, ClipboardCheck, ClipboardList, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrescriptionsPage() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionPharmacistListItem[]>([]);
  const [pagination, setPagination] = useState<PrescriptionsListResponse['pagination'] | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'dispensed' | 'cancelled'>('all');

  // Load prescriptions
  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<PrescriptionsListResponse>('/prescriptions', {
        params: {
          page,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      setPrescriptions(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [page, statusFilter]);

  // Handle dispensing
  const router = useRouter();

  const handleDispense = (prescriptionId: string) => {
    // navigate to detail view where dispensing (with item ids/quantities) occurs
    router.push(`/pharmacist/prescriptions/${prescriptionId}`);
  };

  const getStatusBadge = (status: PharmacistPrescriptionDto['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 gap-1 text-xs font-normal">
            <Clock className="size-3" />
            Pending
          </Badge>
        );
      case 'dispensed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 gap-1 text-xs font-normal">
            <CheckCircle2 className="size-3" />
            Dispensed
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter list client-side based on search term and status tab selection
  const filteredPrescriptions = prescriptions.filter((item) => {
    // Search Filter (by Patient Name or Doctor Name)
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const matchPatient = item.patientName.toLowerCase().includes(query);
      const matchDoctor = item.doctorName.toLowerCase().includes(query);
      return matchPatient || matchDoctor;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Prescriptions Workspace
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Dispense medication prescriptions assigned by doctors to patients.
        </p>
      </div>

      {/* Main card panel */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-5 px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Status tabs */}
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border self-start">
              {(['all', 'pending', 'dispensed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${statusFilter === status ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient or medication..."
                className="h-10 rounded-xl pl-9 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching doctor prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <ClipboardList className="size-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">No Prescriptions Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try resetting filters or checking search spellings." 
                  : "Prescription charts are currently empty."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Patient</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prescribed Items</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((item) => {
                    const parsedDate = new Date(item.consultationDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <TableRow key={item.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4.5 pl-6">
                          <div>
                            <Link href={`/pharmacist/prescriptions/${item.id}`} className="font-bold text-foreground hover:underline">{item.patientName}</Link>
                            <p className="text-xs text-muted-foreground mt-0.5">Diagnosed: {parsedDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4.5 font-semibold text-foreground">
                          Dr {item.doctorName}
                        </TableCell>
                        <TableCell className="py-4.5">
                          {item.prescribedItemsCount} item{item.prescribedItemsCount !== 1 && 's'}
                        </TableCell>
                        <TableCell className="py-4.5">
                          {getStatusBadge(item.status as PharmacistPrescriptionDto['status'])}
                        </TableCell>
                        <TableCell className="py-4.5 text-right pr-6">
                          <Button
                            onClick={() => handleDispense(item.id)}
                          >
                            <Eye className="size-3.5" />
                            See Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination controls */}
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
