'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { handleClientError } from '@/lib/api';
import {
  ReceptionistAppointmentDto,
  ReceptionistAppointmentsResponse,
  DoctorDto,
  DoctorsResponse,
  PatientDto,
  PatientsResponse,
} from '@app/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Calendar,
  CalendarDays,
  Clock,
  Edit2,
  Filter,
  Loader2,
  Search,
  Stethoscope,
  Trash2,
  User,
  X,
  Check,
  ArrowLeft,
  CalendarPlus,
  ReceiptText,
} from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL parameters
  const patientIdParam = searchParams.get('patientId');
  const doctorIdParam = searchParams.get('doctorId');

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>(
    doctorIdParam ? 'doctor' : 'patient'
  );

  // Filters state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdParam || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctorIdParam || '');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<PatientDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Selected Profile Context
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(null);

  // Appointments List State
  const [appointments, setAppointments] = useState<ReceptionistAppointmentDto[]>([]);
  const [pagination, setPagination] = useState<ReceptionistAppointmentsResponse['pagination'] | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Action states: rescheduling
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);

  // Load doctors list for select dropdown
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        const res = await api.get<DoctorsResponse>('/doctors', { params: { limit: 100 } });
        setDoctors(res.data.data);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  // Search patients list for selection
  useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setPatientResults([]);
      return;
    }

    const searchPatients = async () => {
      try {
        setIsSearchingPatients(true);
        const res = await api.get<PatientsResponse>('/patients', {
          params: { search: patientSearch.trim(), limit: 5 },
        });
        setPatientResults(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingPatients(false);
      }
    };

    const delay = setTimeout(searchPatients, 300);
    return () => clearTimeout(delay);
  }, [patientSearch]);

  // Load selected Patient Profile
  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null);
      return;
    }
    const loadPatient = async () => {
      try {
        const res = await api.get<PatientDto>(`/patients/${selectedPatientId}`);
        setSelectedPatient(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadPatient();
  }, [selectedPatientId]);

  // Load selected Doctor Profile
  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDoctor(null);
      return;
    }
    const doc = doctors.find((d) => d.id === selectedDoctorId);
    if (doc) {
      setSelectedDoctor(doc);
    }
  }, [selectedDoctorId, doctors]);

  // Load appointments list once filters are loaded
  const loadAppointments = async () => {
    const filterId = activeTab === 'patient' ? selectedPatientId : selectedDoctorId;
    if (!filterId) {
      setAppointments([]);
      setPagination(null);
      return;
    }

    try {
      setIsLoadingAppointments(true);
      const params = {
        page,
        limit: 10,
        patientId: activeTab === 'patient' ? selectedPatientId : undefined,
        doctorId: activeTab === 'doctor' ? selectedDoctorId : undefined,
      };
      const res = await api.get<ReceptionistAppointmentsResponse>('/appointments', { params });
      setAppointments(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      handleClientError(error);
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedPatientId, selectedDoctorId, activeTab, page]);

  // Handle Reschedule
  const startRescheduling = (appt: ReceptionistAppointmentDto) => {
    setReschedulingId(appt.id);
    const localDate = new Date(appt.datetime);
    const offset = localDate.getTimezoneOffset() * 60000;
    const dateString = new Date(localDate.getTime() - offset).toISOString().slice(0, 16);
    setRescheduleTime(dateString);
  };

  const saveReschedule = async (appointmentId: string) => {
    if (!rescheduleTime) return;
    try {
      setIsSavingReschedule(true);
      await api.put(`/appointments/${appointmentId}`, {
        datetime: new Date(rescheduleTime).toISOString(),
      });
      toast.success('Appointment rescheduled successfully');
      setReschedulingId(null);
      loadAppointments();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSavingReschedule(false);
    }
  };

  // Handle Cancellation
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const cancelAppointment = (appointmentId: string) => {
    setCancelTargetId(appointmentId);
    setCancelConfirmOpen(true);
  };

  const performCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await api.put(`/appointments/${cancelTargetId}`, { status: 'cancelled' });
      toast.success('Appointment cancelled successfully');
      setCancelConfirmOpen(false);
      setCancelTargetId(null);
      loadAppointments();
    } catch (error) {
      handleClientError(error);
    }
  };

  const generateReceipt = async (appointmentId: string) => {
    try {
      const response = await api.post(
        '/bills/generate-receipt',
        { appointmentId },
        { responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(response.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (error) {
      handleClientError(error);
    }
  };

  // Clear filters
  const resetFilters = () => {
    setSelectedPatientId('');
    setSelectedDoctorId('');
    setPatientSearch('');
    setPatientResults([]);
    router.replace('/receptionist/appointments');
  };

  const getStatusBadge = (status: ReceptionistAppointmentDto['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className="bg-sky-500/10 text-sky-600 border border-sky-500/20 hover:bg-sky-500/15">
            Scheduled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15">
            Completed
          </Badge>
        );
      case 'progress':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15">
            In Progress
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="hover:bg-destructive/90">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Upper header summary card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                Manage Appointments
              </CardTitle>
              <CardDescription>Reschedule, cancel, or audit scheduled patient visits.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10"
              onClick={() => router.push('/receptionist')}
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel appointment"
        description="Are you sure you want to cancel this appointment?"
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        onConfirm={performCancel}
        onCancel={() => {
          setCancelConfirmOpen(false);
          setCancelTargetId(null);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Left Column: Filter Sidebar */}
        <Card className="border-border h-fit">
          <CardHeader className="border-b border-border p-4 bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Filter Tabs */}
            <div className="flex rounded-xl bg-muted p-1 border border-border">
              <button
                type="button"
                className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'patient'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('patient');
                  setPage(1);
                }}
              >
                By Patient
              </button>
              <button
                type="button"
                className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'doctor'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('doctor');
                  setPage(1);
                }}
              >
                By Doctor
              </button>
            </div>

            {/* Tab 1: Patient Search Selector */}
            {activeTab === 'patient' && (
              <div className="space-y-3">
                <Label htmlFor="patientSearch">Search Patient</Label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary border border-primary/20">
                        {selectedPatient.firstName[0]}
                        {selectedPatient.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{selectedPatient.phoneNumber}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={resetFilters}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="patientSearch"
                      placeholder="Type patient name to search..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="h-11 rounded-xl pl-10 border-border"
                    />
                    {isSearchingPatients && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {/* Autocomplete Results */}
                    {patientResults.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1.5 z-10 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg p-1 space-y-0.5">
                        {patientResults.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setPatientResults([]);
                              setPatientSearch('');
                            }}
                            className="w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                              {patient.firstName[0]}
                              {patient.lastName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{patient.phoneNumber}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Doctor Selector */}
            {activeTab === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="doctorSelector">Select Attending Doctor</Label>
                {selectedDoctorId ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary border border-primary/20">
                        {selectedDoctor?.firstName[0]}
                        {selectedDoctor?.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{selectedDoctor?.departmentName}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={resetFilters}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedDoctorId}
                    onValueChange={(val) => setSelectedDoctorId(val)}
                  >
                    <SelectTrigger id="doctorSelector" className="h-11 rounded-xl">
                      <SelectValue placeholder="Choose attending doctor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDoctors ? (
                        <div className="p-3 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Loading...
                        </div>
                      ) : doctors.length === 0 ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          No doctors found
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.firstName} {doctor.lastName} ({doctor.departmentName})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Clear Filters Button */}
            {(selectedPatientId || selectedDoctorId) && (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="w-full h-10 rounded-xl"
              >
                Clear Selected Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Appointments List */}
        <div className="space-y-4">
          {!selectedPatientId && !selectedDoctorId ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center border border-border bg-card">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25">
                <Search className="size-6" />
              </div>
              <CardTitle className="mt-6 text-base font-bold text-foreground">
                Select a Patient or Doctor
              </CardTitle>
              <CardDescription className="mt-2 max-w-sm">
                To retrieve scheduling records from the backend, please select a patient name or search for a doctor using the sidebar filters.
              </CardDescription>
            </Card>
          ) : isLoadingAppointments ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center border border-border bg-card">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Querying appointment database...
              </p>
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center border border-border bg-card">
              <Calendar className="size-10 text-muted-foreground" />
              <CardTitle className="mt-4 text-base font-semibold text-foreground">
                No Appointments Scheduled
              </CardTitle>
              <CardDescription className="mt-2 max-w-sm">
                There are no scheduled visits for the selected filter criteria.
              </CardDescription>
              {selectedPatientId && (
                <Button asChild className="mt-6 rounded-xl">
                  <Link href={`/receptionist/appointments/new?patientId=${selectedPatientId}`}>
                    <CalendarPlus className="size-4 mr-2" />
                    Book First Appointment
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                        {activeTab === 'patient' ? 'Attending Doctor' : 'Patient Name'}
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Scheduled Slot</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 w-[250px]">Reason</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Status</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appt) => {
                      const displayUser =
                        activeTab === 'patient'
                          ? `Dr. ${appt.doctorName}`
                          : appt.patientName;
                      const formattedDate = new Date(appt.datetime).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      });

                      const isRescheduling = reschedulingId === appt.id;

                      return (
                        <TableRow key={appt.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                          <TableCell className="font-semibold text-foreground py-4">
                            <div className="flex items-center gap-2">
                              {activeTab === 'patient' ? (
                                <Stethoscope className="size-4 text-primary shrink-0" />
                              ) : (
                                <User className="size-4 text-primary shrink-0" />
                              )}
                              <span>{displayUser}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            {isRescheduling ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="datetime-local"
                                  value={rescheduleTime}
                                  onChange={(e) => setRescheduleTime(e.target.value)}
                                  className="h-9 w-44 rounded-lg text-xs"
                                />
                                <Button
                                  type="button"
                                  onClick={() => saveReschedule(appt.id)}
                                  size="icon"
                                  className="size-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={isSavingReschedule}
                                >
                                  {isSavingReschedule ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Check className="size-3.5" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => setReschedulingId(null)}
                                  size="icon"
                                  variant="outline"
                                  className="size-8 rounded-lg text-muted-foreground"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                                <span>{formattedDate}</span>
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="py-4 text-sm text-muted-foreground max-w-[250px] truncate" title={appt.reason}>
                            {appt.reason}
                          </TableCell>

                          <TableCell className="py-4">{getStatusBadge(appt.status)}</TableCell>
                          
                          <TableCell className="py-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab === 'doctor' && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="icon"
                                  className="rounded-xl size-8"
                                  title="Book appointment for this patient"
                                >
                                  <Link href={`/receptionist/appointments/new?patientId=${appt.patientId}`}>
                                    <CalendarPlus className="size-3.5" />
                                  </Link>
                                </Button>
                              )}
                              {(appt.status === 'progress' || appt.status === 'completed') && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => generateReceipt(appt.id)}
                                  className="rounded-xl size-8"
                                  title="Generate receipt"
                                >
                                  <ReceiptText className="size-3.5" />
                                </Button>
                              )}
                              {appt.status === 'scheduled' && !isRescheduling && (
                                <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startRescheduling(appt)}
                                  className="rounded-xl h-8 text-xs"
                                >
                                  <Edit2 className="size-3 mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => cancelAppointment(appt.id)}
                                  className="rounded-xl size-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List Card Layout */}
              <div className="grid gap-4 md:hidden">
                {appointments.map((appt) => {
                  const displayUser =
                    activeTab === 'patient'
                      ? `Dr. ${appt.doctorName}`
                      : appt.patientName;
                  const formattedDate = new Date(appt.datetime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  const isRescheduling = reschedulingId === appt.id;

                  return (
                    <div key={appt.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          {activeTab === 'patient' ? (
                            <Stethoscope className="size-4 text-primary shrink-0" />
                          ) : (
                            <User className="size-4 text-primary shrink-0" />
                          )}
                          <span>{displayUser}</span>
                        </div>
                        {getStatusBadge(appt.status)}
                      </div>

                      {/* Reschedule inline editor */}
                      {isRescheduling ? (
                        <div className="rounded-xl bg-muted/40 p-2 border border-border space-y-2">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Reschedule Time</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="datetime-local"
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                              className="h-9 rounded-lg text-xs"
                            />
                            <Button
                              type="button"
                              onClick={() => saveReschedule(appt.id)}
                              size="sm"
                              className="h-9 rounded-lg px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={isSavingReschedule}
                            >
                              {isSavingReschedule ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setReschedulingId(null)}
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-lg px-2.5 text-muted-foreground"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 bg-muted/40 p-2 rounded-xl border border-border">
                          <Clock className="size-3.5 text-primary" />
                          <span>{formattedDate}</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground leading-relaxed p-1">
                        <span className="font-semibold text-foreground">Reason:</span> {appt.reason}
                      </div>

                      {appt.status === 'scheduled' && !isRescheduling && (
                        <div className="flex gap-2 pt-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startRescheduling(appt)}
                            className="flex-1 rounded-xl h-9 text-xs"
                          >
                            <Edit2 className="size-3 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cancelAppointment(appt.id)}
                            className="flex-1 rounded-xl h-9 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        {activeTab === 'doctor' && (
                          <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs">
                            <Link href={`/receptionist/appointments/new?patientId=${appt.patientId}`}>
                              <CalendarPlus className="size-3 mr-1" />
                              New Visit
                            </Link>
                          </Button>
                        )}
                        {(appt.status === 'progress' || appt.status === 'completed') && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generateReceipt(appt.id)}
                            className="rounded-xl h-9 text-xs"
                          >
                            <ReceiptText className="size-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Footers */}
              {pagination && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-muted-foreground text-center sm:text-left">
                    Showing Page {pagination.page ?? page} of {pagination.totalPages ?? 1} ({pagination.total ?? 0} total scheduled visits)
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-9 px-4"
                      disabled={!pagination.hasPreviousPage || isLoadingAppointments}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-9 px-4"
                      disabled={!pagination.hasNextPage || isLoadingAppointments}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
