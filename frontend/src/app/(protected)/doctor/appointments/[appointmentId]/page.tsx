'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api, { handleClientError } from '@/lib/api';
import {
  ConsultationDto,
  DoctorAppointmentDto,
  labTests,
  LabTestType,
  MedicineDto,
  MedicineResponseDto,
} from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardPlus,
  FlaskConical,
  Loader2,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  UserRound,
} from 'lucide-react';

interface PrescriptionDraft {
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const emptyPrescription: PrescriptionDraft = {
  medicationId: '',
  dosage: '',
  frequency: '',
  duration: '',
};

const formatLabTest = (test: string) => {
  return test
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function DoctorConsultationFormPage() {
  const params = useParams();
  const appointmentId = params?.appointmentId as string;
  const router = useRouter();

  const [appointment, setAppointment] = useState<DoctorAppointmentDto | null>(null);
  const [medicines, setMedicines] = useState<MedicineDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionDraft[]>([{ ...emptyPrescription }]);
  const [selectedLabTests, setSelectedLabTests] = useState<LabTestType[]>([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appointmentResponse, medicineResponse] = await Promise.all([
        api.get<DoctorAppointmentDto>(`/appointments/${appointmentId}`),
        api.get<MedicineResponseDto>('/medicines', { params: { page: 1, limit: 100 } }),
      ]);
      setAppointment(appointmentResponse.data);
      setMedicines(medicineResponse.data.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const updatePrescription = (index: number, field: keyof PrescriptionDraft, value: string) => {
    setPrescriptions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const removePrescription = (index: number) => {
    setPrescriptions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleLabTest = (test: LabTestType) => {
    setSelectedLabTests((current) =>
      current.includes(test) ? current.filter((item) => item !== test) : [...current, test]
    );
  };

  const validPrescriptions = prescriptions.filter(
    (item) => item.medicationId && item.dosage.trim() && item.frequency.trim() && item.duration.trim()
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!diagnosis.trim() && !notes.trim()) {
      toast.error('Add a diagnosis or consultation note before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      const consultationResponse = await api.post<ConsultationDto>('/consultations', {
        appointmentId,
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
        prescriptions: validPrescriptions.length > 0 ? validPrescriptions : undefined,
      });

      if (selectedLabTests.length > 0) {
        await Promise.all(
          selectedLabTests.map((testType) =>
            api.post('/lab-requests', {
              consultationId: consultationResponse.data.id,
              testType,
            })
          )
        );
      }

      toast.success('Consultation saved');
      router.push('/doctor/appointments');
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading consultation workspace...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
          <ClipboardPlus className="size-6" />
        </div>
        <h3 className="font-bold text-foreground text-base">Appointment Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This appointment could not be loaded for consultation.
        </p>
        <Button variant="outline" onClick={() => router.back()} className="mt-5 rounded-lg">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
    );
  }

  const visitTime = new Date(appointment.datetime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Create Consultation
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Record clinical notes, prescriptions, and laboratory requests.
          </p>
        </div>
        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 text-xs font-normal">
          {appointment.status}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <CardTitle className="text-lg">Appointment Summary</CardTitle>
            <CardDescription>Patient and visit information.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Patient</p>
                <p className="font-bold text-foreground truncate">{appointment.patientName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/10">
                <CalendarDays className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Visit Time</p>
                <p className="font-bold text-foreground truncate">{visitTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                <Stethoscope className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Reason</p>
                <p className="font-bold text-foreground">{appointment.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg">Clinical Notes</CardTitle>
              <CardDescription>Diagnosis and observations from the visit.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  placeholder="Enter diagnosis"
                  className="h-10 rounded-xl border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter clinical notes, symptoms, observations, and follow-up guidance..."
                  className="min-h-36 rounded-xl border-border resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Prescriptions</CardTitle>
                  <CardDescription>Add medications for the pharmacy queue.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setPrescriptions((current) => [...current, { ...emptyPrescription }])}
                >
                  <Plus className="size-4" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="rounded-2xl border border-border p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Pill className="size-4 text-primary" />
                      Medication {index + 1}
                    </div>
                    {prescriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => removePrescription(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Medication</Label>
                      <select
                        value={prescription.medicationId}
                        onChange={(event) => updatePrescription(index, 'medicationId', event.target.value)}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="">Select medication</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name} ({medicine.stockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input
                        value={prescription.dosage}
                        onChange={(event) => updatePrescription(index, 'dosage', event.target.value)}
                        placeholder="e.g. 500mg"
                        className="h-10 rounded-xl border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Input
                        value={prescription.frequency}
                        onChange={(event) => updatePrescription(index, 'frequency', event.target.value)}
                        placeholder="e.g. Twice daily"
                        className="h-10 rounded-xl border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={prescription.duration}
                        onChange={(event) => updatePrescription(index, 'duration', event.target.value)}
                        placeholder="e.g. 5 days"
                        className="h-10 rounded-xl border-border"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg">Lab Requests</CardTitle>
              <CardDescription>Choose tests to send to the laboratory queue.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {labTests.map((test) => {
                  const selected = selectedLabTests.includes(test);
                  return (
                    <button
                      key={test}
                      type="button"
                      onClick={() => toggleLabTest(test)}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-sm font-semibold transition-colors ${selected ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/30 hover:bg-primary/5'}`}
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                        <FlaskConical className="size-4" />
                      </span>
                      {formatLabTest(test)}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Saving marks this appointment as completed and sends prescriptions or lab requests to the right teams.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || appointment.status !== 'scheduled'} className="rounded-lg">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Consultation
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
