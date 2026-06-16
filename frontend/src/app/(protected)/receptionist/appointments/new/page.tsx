'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { handleClientError } from '@/lib/api';
import { CreateAppointmentDto, DoctorDto, DoctorsResponse, PatientDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import LoadingPage from '@/components/loading-page';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Clock,
  FileText,
  Loader2,
  ShieldAlert,
  Stethoscope,
  User,
} from 'lucide-react';

type FormValues = {
  doctorId: string;
  datetime: string;
  reason: string;
};

const initialForm: FormValues = {
  doctorId: '',
  datetime: '',
  reason: '',
};

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [form, setForm] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!patientId) {
      toast.error('Patient ID is required to book an appointment');
      router.push('/receptionist');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load patient and doctor lists in parallel
        const [patientRes, doctorsRes] = await Promise.all([
          api.get<PatientDto>(`/patients/${patientId}`),
          api.get<DoctorsResponse>('/doctors', { params: { limit: 100 } }),
        ]);

        setPatient(patientRes.data);
        setDoctors(doctorsRes.data.data);
      } catch (error) {
        handleClientError(error);
        toast.error('Failed to load scheduling dependencies');
        router.push('/receptionist');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [patientId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const localErrors: Record<string, string> = {};
    if (!form.doctorId) localErrors.doctorId = 'Please select a doctor';
    if (!form.datetime) localErrors.datetime = 'Appointment date and time is required';
    if (!form.reason) localErrors.reason = 'Reason for appointment is required';
    if (form.reason && form.reason.length < 5) {
      localErrors.reason = 'Reason must be at least 5 characters long';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    const payload: CreateAppointmentDto = {
      patientId: patientId!,
      doctorId: form.doctorId,
      datetime: new Date(form.datetime).toISOString(),
      reason: form.reason.trim(),
    };

    setIsSubmitting(true);
    try {
      await api.post('/appointments', payload);
      toast.success('Appointment scheduled successfully');
      router.push(`/receptionist/patients/${patientId}`);
    } catch (err) {
      handleClientError(err, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Patient Confirmation Header */}
      {patient && (
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="bg-muted/10 border-b border-border py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Appointment For</p>
                <p className="text-sm font-bold text-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Email:</span> {patient.email}
            </div>
            <div>
              <span className="font-semibold text-foreground">Phone:</span> {patient.phoneNumber}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Scheduling Card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarPlus className="size-5 text-primary" />
                Schedule Appointment
              </CardTitle>
              <CardDescription>Select an attending doctor, schedule slot, and state reason.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 self-start sm:self-auto"
              onClick={() => router.push(`/receptionist/patients/${patientId}`)}
            >
              <ArrowLeft className="size-4" />
              Back to Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctorId" className="flex items-center gap-1.5">
                <Stethoscope className="size-4 text-muted-foreground" />
                Attending Doctor <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.doctorId}
                onValueChange={(val) => handleSelectChange('doctorId', val)}
              >
                <SelectTrigger id="doctorId" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select attending clinician..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No doctors available in directory
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
              {errors.doctorId && <p className="text-sm text-destructive">{errors.doctorId}</p>}
            </div>

            {/* Field 2: Appointment DateTime */}
            <div className="space-y-2">
              <Label htmlFor="datetime" className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                Appointment Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="datetime"
                name="datetime"
                type="datetime-local"
                value={form.datetime}
                onChange={handleChange}
                className="h-11 rounded-xl"
              />
              {errors.datetime && <p className="text-sm text-destructive">{errors.datetime}</p>}
            </div>

            {/* Field 3: Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-1.5">
                <FileText className="size-4 text-muted-foreground" />
                Reason for Visit <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="State symptoms, clinical checks, or reference history..."
                value={form.reason}
                onChange={handleChange}
                rows={4}
                className="rounded-xl min-h-24"
              />
              {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6"
                onClick={() => router.push(`/receptionist/patients/${patientId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-xl px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    Schedule Appointment
                    <Calendar className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
