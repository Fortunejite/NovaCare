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
import {
  Table,
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

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Reception dashboard</CardTitle>
              <CardDescription>
                Search patients or register a new one from here.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              Front desk workspace
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label
                htmlFor="patient-search"
                className="text-sm font-medium text-foreground"
              >
                Search Patient
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="patient-search"
                    type="search"
                    placeholder="Search by name or patient ID"
                    className="h-11 rounded-xl pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                asChild
                type="button"
                className="h-11 w-full rounded-xl lg:w-auto"
              >
                <Link href="/receptionist/patients/new">
                  <UserPlus className="size-4" />
                  Register patient
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="px-4 py-10 sm:px-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading Patient Records...
              </div>
            </TableCell>
          </TableRow>
        ) : patients.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6"
            >
              {searchTerm
                ? 'No patients found for the given search criteria.'
                : 'Search for patients to view their records.'}
            </TableCell>
          </TableRow>
        ) : (
          patients.map((patient) => {
            const age =
              new Date().getFullYear() -
              new Date(patient.dateOfBirth).getFullYear();
            return (
              <TableRow key={patient.id}>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{age}</TableCell>
                <TableCell>{patient.phoneNumber}</TableCell>
                <TableCell>
									<div className="flex items-center gap-2">
										<Button asChild variant="outline" size="sm">
											<Link href={`/receptionist/patients/${patient.id}`}>
												<Eye className="size-4" />
											</Link>
										</Button>
										<Button asChild variant="outline" size="sm">
											<Link href={`/receptionist/appointments/new?patientId=${patient.id}`}>
												<CalendarPlus className="size-4" />
											</Link>
										</Button>
									</div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </Table>
      {pagination && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page ?? page} of {pagination.totalPages ?? 1}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasPreviousPage || isLoading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
