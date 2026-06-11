'use client';

import api, { handleClientError } from '@/lib/api';
import { StaffDto, StaffResponse, StaffSummaryResponse } from '@app/shared';
import { Ban, Eye, Loader2, Microscope, Pill, Stethoscope, ClipboardList, Users, UserCheck, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getStaffPath = (staff: StaffDto) => {
  switch (staff.role) {
    case 'doctor':
      return `/admin/doctors/${staff.profileId}`;
    case 'receptionist':
      return `/admin/receptionists/${staff.profileId}`;
    case 'pharmacist':
      return `/admin/pharmacists/${staff.profileId}`;
    case 'labTechnician':
      return `/admin/lab-technicians/${staff.profileId}`;
    default:
      return '/admin';
  }
}

export default function AdminHomepage() {
  const router = useRouter();
  const [staffResponse, setStaffResponse] = useState<StaffResponse | null>(null);
  const [summary, setSummary] = useState<StaffSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling, setIsDisabling] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const summaryCards = [
    { key: 'doctors' as const, label: 'Doctors', icon: Stethoscope, href: '/admin/doctors' },
    { key: 'pharmacists' as const, label: 'Pharmacists', icon: Pill, href: '/admin/pharmacists' },
    { key: 'receptionists' as const, label: 'Receptionists', icon: ClipboardList, href: '/admin/receptionists' },
    { key: 'labTechnicians' as const, label: 'Lab technicians', icon: Microscope, href: '/admin/lab-technicians' },
  ];

  const loadData = async (targetPage: number) => {
    setIsLoading(true);

    try {
      const [staffResult, summaryResult] = await Promise.all([
        api.get('/staff', {
          params: {
            page: targetPage,
            limit,
          },
        }),
        api.get('/staff/summary'),
      ]);

      setStaffResponse(staffResult.data);
      setSummary(summaryResult.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [page]);

  const handleEnable = async (staff: StaffDto) => {
    setIsDisabling(staff.id);

    try {
      await api.post('/auth/users/enable', { email: staff.email });
      await loadData(page);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDisabling(null);
    }
  };

  const handleDisable = async (staff: StaffDto) => {
    setIsDisabling(staff.id);

    try {
      await api.post('/auth/users/disable', { email: staff.email });
      await loadData(page);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDisabling(null);
    }
  };

  const handleOpenDetails = (staff: StaffDto) => {
    const url = getStaffPath(staff)
    router.push(url);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Link key={item.key} href={item.href} className="group block">
            <Card className="gap-0 py-4 transition-colors group-hover:border-primary/40 group-hover:bg-muted/20">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <span className="text-3xl font-semibold tracking-tight text-foreground">
                    {summary?.[item.key] ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Staff directory</CardTitle>
              <p className="text-sm text-muted-foreground">Review staff records, open profiles, or disable accounts.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                {staffResponse?.pagination.total ?? 0} staff members
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => router.push('/admin/departments')}>
                Manage departments
              </Button>
              <Button type="button" size="sm" onClick={() => router.push('/admin/create-staff')}>
                Create staff
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border hover:bg-muted/30">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Staff</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Role</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Email</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Status</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-10 sm:px-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading staff
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffResponse?.data?.length ? (
                staffResponse.data.map((staff) => (
                  <TableRow key={staff.id} className="align-top">
                    <TableCell className="px-4 py-4 sm:px-6">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {staff.firstName || staff.lastName
                            ? `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim()
                            : 'Unnamed staff'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <Badge variant="outline" className="capitalize">
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-foreground">{staff.email}</p>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <Badge variant={staff.status === 'active' ? "default" : "secondary"} className="capitalize">
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => handleOpenDetails(staff)}
                          disabled={!staff.profileId}
                          variant="outline"
                          size="icon-sm"
                          className="rounded-full"
                          aria-label={`Open ${staff.email} details`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {
                          staff.status === 'active' ? (
                            <Button
                              type="button"
                              onClick={() => handleDisable(staff)}
                              disabled={isDisabling === staff.id}
                              variant="destructive"
                              size="icon-sm"
                              className="rounded-full"
                              aria-label={`Disable ${staff.email}`}
                            >
                              {isDisabling === staff.id ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => handleEnable(staff)}
                              variant="secondary"
                              size="icon-sm"
                              className="rounded-full"
                              aria-label={`Enable ${staff.email}`}
                            >
                              <UserCheck className="size-4" />
                            </Button>
                          )
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                    No staff found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            Page {staffResponse?.pagination.page ?? page} of {staffResponse?.pagination.totalPages ?? 1}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!staffResponse?.pagination.hasPreviousPage || isLoading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!staffResponse?.pagination.hasNextPage || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}