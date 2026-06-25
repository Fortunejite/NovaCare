'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api, { handleClientError } from '@/lib/api';
import {
  ConsultationDto,
  labTests,
  LabTestType,
  MedicineDto,
  MedicineResponseDto,
} from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  FlaskConical,
  Loader2,
  Pill,
  Plus,
  Save,
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

export default function EditConsultationPage() {
  const params = useParams();
  const consultationId = params?.consultationId as string;
  const router = useRouter();

  const [consultation, setConsultation] = useState<ConsultationDto | null>(null);
  const [medicines, setMedicines] = useState<MedicineDto[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionDraft[]>([{ ...emptyPrescription }]);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTestType>('blood_test');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [isRequestingLab, setIsRequestingLab] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadConsultation = useCallback(async () => {
    try {
      setIsLoading(true);
      const [consultationResponse, medicineResponse] = await Promise.all([
        api.get<ConsultationDto>(`/consultations/${consultationId}`),
        api.get<MedicineResponseDto>('/medicines', { params: { page: 1, limit: 100 } }),
      ]);
      setConsultation(consultationResponse.data);
      setDiagnosis(consultationResponse.data.diagnosis ?? '');
      setNotes(consultationResponse.data.notes ?? '');
      setMedicines(medicineResponse.data.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConsultation();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConsultation]);

  const updatePrescription = (index: number, field: keyof PrescriptionDraft, value: string) => {
    setPrescriptions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const removePrescription = (index: number) => {
    setPrescriptions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveConsultation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const res = await api.patch<ConsultationDto>(`/consultations/${consultationId}`, {
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setConsultation(res.data);
      toast.success('Consultation updated');
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const markCompleted = async () => {
    try {
      setIsCompleting(true);
      await api.patch<ConsultationDto>(`/consultations/${consultationId}/status`);
      toast.success('Consultation marked as completed');
      router.push(`/doctor/consultations/${consultationId}/details`);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsCompleting(false);
      setConfirmOpen(false);
    }
  };

  const validPrescriptions = prescriptions.filter(
    (item) => item.medicationId && item.dosage.trim() && item.frequency.trim() && item.duration.trim()
  );

  const addPrescriptions = async () => {
    if (validPrescriptions.length === 0) {
      toast.error('Add at least one complete prescription item.');
      return;
    }

    try {
      setIsAddingPrescription(true);
      const res = await api.post('/prescriptions', {
        consultationId,
        prescriptions: validPrescriptions,
      });
      toast.success('Prescription added');
      setPrescriptions([{ ...emptyPrescription }]);
      await loadConsultation();
      return res.data;
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsAddingPrescription(false);
    }
  };

  const requestLabTest = async () => {
    try {
      setIsRequestingLab(true);
      await api.post('/lab-requests', {
        consultationId,
        testType: selectedLabTest,
      });
      toast.success('Lab request added');
      await loadConsultation();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsRequestingLab(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading consultation editor...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
          <FileText className="size-6" />
        </div>
        <h3 className="font-bold text-foreground text-base">Consultation Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This consultation could not be loaded for editing.
        </p>
        <Button variant="outline" onClick={() => router.back()} className="mt-5 rounded-lg">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
    );
  }

  const canEdit = consultation.appointmentStatus === 'progress';

  return (
    <>
      <form onSubmit={saveConsultation} className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Edit Consultation
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Update clinical notes before marking the consultation completed.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="rounded-lg">
              <Link href={`/doctor/consultations/${consultation.id}/details`}>
                <ArrowLeft className="size-4" />
                Details
              </Link>
            </Button>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                disabled={isCompleting}
                className="rounded-lg text-emerald-700 hover:text-emerald-700"
              >
                {isCompleting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Mark Completed
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.4fr]">
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg">Patient Summary</CardTitle>
              <CardDescription>Consultation owner and appointment state.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                  <UserRound className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Patient</p>
                  <p className="font-bold text-foreground truncate">{consultation.patientName}</p>
                  <p className="text-xs text-muted-foreground">{consultation.patientPhoneNumber}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Appointment Status</p>
                <Badge variant="outline" className="mt-2 capitalize">
                  {consultation.appointmentStatus === 'progress' ? 'in progress' : consultation.appointmentStatus}
                </Badge>
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
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                    className="min-h-56 rounded-xl border-border resize-y"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!canEdit || isSaving} className="rounded-lg">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Add Prescriptions</CardTitle>
                    <CardDescription>Add medication orders to the pharmacy queue.</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    disabled={!canEdit}
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
                          disabled={!canEdit}
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
                          disabled={!canEdit}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
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
                          disabled={!canEdit}
                          className="h-10 rounded-xl border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Input
                          value={prescription.frequency}
                          onChange={(event) => updatePrescription(index, 'frequency', event.target.value)}
                          placeholder="e.g. Twice daily"
                          disabled={!canEdit}
                          className="h-10 rounded-xl border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={prescription.duration}
                          onChange={(event) => updatePrescription(index, 'duration', event.target.value)}
                          placeholder="e.g. 5 days"
                          disabled={!canEdit}
                          className="h-10 rounded-xl border-border"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={addPrescriptions}
                    disabled={!canEdit || isAddingPrescription}
                    className="rounded-lg"
                  >
                    {isAddingPrescription ? <Loader2 className="size-4 animate-spin" /> : <Pill className="size-4" />}
                    Add Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
                <CardTitle className="text-lg">Request Lab Test</CardTitle>
                <CardDescription>Send a lab request to the laboratory queue.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedLabTest}
                    onChange={(event) => setSelectedLabTest(event.target.value as LabTestType)}
                    disabled={!canEdit}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  >
                    {labTests.map((test) => (
                      <option key={test} value={test}>
                        {formatLabTest(test)}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={requestLabTest}
                    disabled={!canEdit || isRequestingLab}
                    className="rounded-lg"
                  >
                    {isRequestingLab ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
                    Request Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Mark consultation as completed"
        description="This will close the consultation and prevent further editing or lab requests. Proceed?"
        confirmLabel="Mark Completed"
        cancelLabel="Cancel"
        onConfirm={markCompleted}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
