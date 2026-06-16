'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api, { handleClientError } from '@/lib/api';
import { PatientDto, PatientsResponse } from '@app/shared';
import {
  ArrowRight,
  CalendarPlus,
  Eye,
  Loader2,
  Search,
  UserPlus,
  Users,
  Phone,
  ClipboardList,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ReceptionistDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [pagination, setPagination] = useState<
    PatientsResponse['pagination'] | null
  >(null);

  const lastAppliedSearchRef = useRef('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPatients = async () => {
      const filterChanged =
        lastAppliedSearchRef.current !== debouncedSearchQuery;

      if (!filterChanged) {
        return;
      }

      if (debouncedSearchQuery === '') {
        setPatients([]);
        return;
      }

      if (filterChanged && page !== 1) {
        setPage(1);
        return;
      }

      try {
        if (filterChanged) {
          lastAppliedSearchRef.current = debouncedSearchQuery;
        }
        setIsLoading(true);
        const res = await api.get<PatientsResponse>('/patients', {
          params: {
            search: debouncedSearchQuery,
            page,
            limit: 10,
          },
        });
        setPatients(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [debouncedSearchQuery, page]);

  const getStatusBadge = (status: PatientDto['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 text-xs font-normal px-2 py-0">
            Active
          </Badge>
        );
      case 'admitted':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 text-xs font-normal px-2 py-0">
            Admitted
          </Badge>
        );
      case 'discharged':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border hover:bg-muted/50 text-xs font-normal px-2 py-0">
            Discharged
          </Badge>
        );
      case 'deceased':
        return (
          <Badge variant="destructive" className="hover:bg-destructive/95 text-xs font-normal px-2 py-0">
            Deceased
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs font-normal px-2 py-0">{status}</Badge>;
    }
  };

  const getGenderBadge = (gender: string) => {
    const normalized = gender.toLowerCase();
    switch (normalized) {
      case 'male':
        return (
          <Badge className="bg-sky-500/10 text-sky-600 border border-sky-500/20 hover:bg-sky-500/15 text-xs font-normal px-2 py-0">
            Male
          </Badge>
        );
      case 'female':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/15 text-xs font-normal px-2 py-0">
            Female
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/15 text-xs font-normal px-2 py-0 capitalize">
            {gender}
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      {/* Upper header summary card */}
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                Reception Dashboard
              </CardTitle>
              <CardDescription>
                Search patient directory records or execute new patient intake.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border">
              <Users className="size-3.5 text-primary" />
              Front Desk Workspace
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label
                htmlFor="patient-search"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Search Patient Directory
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="patient-search"
                  type="search"
                  placeholder="Search by first name, last name, or phone number..."
                  className="h-11 rounded-xl pl-10 border-border focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                asChild
                type="button"
                className="h-11 w-full rounded-xl md:w-auto"
              >
                <Link href="/receptionist/patients/new">
                  <UserPlus className="size-4 mr-2" />
                  Intake New Patient
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Display Area */}
      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-border bg-card">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Searching patient directory...
          </p>
        </Card>
      ) : patients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-border bg-card">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25">
            <Search className="size-6" />
          </div>
          <CardTitle className="mt-6 text-base font-bold text-foreground">
            {searchTerm ? 'No Record Matches' : 'Search for Patients'}
          </CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            {searchTerm
              ? 'We couldn\'t find any patients matching that search query. Please double-check spelling or try search terms.'
              : 'Enter a name or phone number in the search bar above to query patient charts and files.'}
          </CardDescription>
          {!searchTerm && (
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Tip: Register them first if they are new visitors.</span>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border">
                  <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Initials</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">First Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Last Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Gender</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Age</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Phone Number</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const age =
                    new Date().getFullYear() -
                    new Date(patient.dateOfBirth).getFullYear();
                  return (
                    <TableRow key={patient.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="py-3.5 text-center">
                        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary border border-primary/20">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-3.5">{patient.firstName}</TableCell>
                      <TableCell className="font-semibold text-foreground py-3.5">{patient.lastName}</TableCell>
                      <TableCell className="py-3.5">{getGenderBadge(patient.gender)}</TableCell>
                      <TableCell className="text-sm font-medium py-3.5">{age} yrs</TableCell>
                      <TableCell className="text-sm py-3.5 text-muted-foreground font-mono">{patient.phoneNumber}</TableCell>
                      <TableCell className="py-3.5">{getStatusBadge(patient.status)}</TableCell>
                      <TableCell className="text-right py-3.5 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className="rounded-xl h-8">
                            <Link href={`/receptionist/patients/${patient.id}`}>
                              <Eye className="size-3.5 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-xl h-8">
                            <Link href={`/receptionist/appointments?patientId=${patient.id}`}>
                              <Calendar className="size-3.5 mr-1" />
                              Appointments
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout (Hidden on desktop) */}
          <div className="grid gap-4 md:hidden">
            {patients.map((patient) => {
              const age =
                new Date().getFullYear() -
                new Date(patient.dateOfBirth).getFullYear();
              return (
                <div key={patient.id} className="rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary border border-primary/20">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getGenderBadge(patient.gender)}
                          <span className="text-xs text-muted-foreground font-medium">• {age} yrs</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(patient.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2 text-xs text-muted-foreground border border-border font-mono">
                    <Phone className="size-3.5 text-primary" />
                    <span>{patient.phoneNumber}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl h-9">
                      <Link href={`/receptionist/patients/${patient.id}`}>
                        <Eye className="size-3.5 mr-1.5" />
                        View Chart
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl h-9">
                      <Link href={`/receptionist/appointments?patientId=${patient.id}`}>
                        <Calendar className="size-3.5 mr-1.5" />
                        Appointments
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {pagination && (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-muted-foreground text-center sm:text-left">
                Showing Page {pagination.page ?? page} of {pagination.totalPages ?? 1} ({pagination.total ?? 0} total records)
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 px-4"
                  disabled={!pagination.hasPreviousPage || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 px-4"
                  disabled={!pagination.hasNextPage || isLoading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
