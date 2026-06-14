'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import api, { handleClientError } from '@/lib/api';
import { PatientDto } from '@app/shared';
import {
  ArrowLeft,
  Loader2,
  PencilLine,
  Mail,
  Phone,
  MapPin,
  Scale,
  Ruler,
  HeartPulse,
  Dna,
  ShieldAlert,
  FileText,
  Calendar,
  User,
  Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

const getAge = (dob: Date | string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateVal: Date | string | null | undefined) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function Page({ params }: IdParamProps) {
  const { id } = use(params);
  const router = useRouter();

  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<PatientDto>(`/patients/${id}`);
        setPatient(res.data);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const getStatusBadge = (status: PatientDto['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15">
            Active
          </Badge>
        );
      case 'admitted':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15">
            Admitted
          </Badge>
        );
      case 'discharged':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border hover:bg-muted/50">
            Discharged
          </Badge>
        );
      case 'deceased':
        return (
          <Badge variant="destructive" className="hover:bg-destructive/95">
            Deceased
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <ShieldAlert className="size-10 text-destructive" />
        <CardTitle className="mt-4 text-lg">Patient Profile Not Found</CardTitle>
        <CardDescription className="mt-2">
          The requested patient record could not be loaded or does not exist.
        </CardDescription>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-xl"
          onClick={() => router.push('/receptionist')}
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header card / Hero section */}
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold uppercase text-primary border border-primary/20">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  {getStatusBadge(patient.status)}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  ID: {patient.id}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10"
                onClick={() => router.push('/receptionist')}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="button"
                className="rounded-xl h-10"
                onClick={() => router.push(`/receptionist/patients/${id}/edit`)}
              >
                <PencilLine className="size-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Key Quick Info 1 */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/10 p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender & Age</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {patient.gender} • {getAge(patient.dateOfBirth)} yrs
              </p>
            </div>
          </div>

          {/* Key Quick Info 2 */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/10 p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(patient.dateOfBirth)}
              </p>
            </div>
          </div>

          {/* Key Quick Info 3 */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/10 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marital Status</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {patient.maritalStatus}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Vitals & Health Metrics */}
        <div className="space-y-6 md:col-span-2">
          {/* Vitals Summary Card */}
          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <HeartPulse className="size-5 text-primary" />
                Vitals & Physical Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <Heart className="size-4 fill-red-500/20" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blood Group</p>
                <p className="mt-1 text-lg font-bold text-foreground font-mono">{patient.bloodGroup || '—'}</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Dna className="size-4" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Genotype</p>
                <p className="mt-1 text-lg font-bold text-foreground font-mono">{patient.genotype || '—'}</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Scale className="size-4" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {patient.weight ? `${patient.weight} kg` : '—'}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Ruler className="size-4" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Height</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {patient.height ? `${patient.height} cm` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Records (Allergies & History) */}
          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Clinical Notes & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <LabelSubTitle>Allergies</LabelSubTitle>
                {patient.allergies ? (
                  <div className="mt-2 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                    <ShieldAlert className="size-5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Active Allergy Warnings</p>
                      <p className="mt-1 text-sm">{patient.allergies}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No known drug, food, or environmental allergies recorded.</p>
                )}
              </div>

              <div>
                <LabelSubTitle>Medical History</LabelSubTitle>
                {patient.medicalHistory ? (
                  <div className="mt-2 rounded-xl border border-border bg-muted/10 p-4 text-foreground">
                    <p className="text-sm whitespace-pre-line leading-relaxed">{patient.medicalHistory}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No previous medical conditions, operations, or family history recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Contact Info & Emergency Contact */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="size-5 text-primary" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex gap-3 items-start">
                <Mail className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-foreground break-all">{patient.email}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Phone className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Phone</p>
                  <p className="text-sm font-medium text-foreground">{patient.phoneNumber}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {patient.address}
                    <br />
                    {patient.city}, {patient.state}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact Card */}
          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{patient.emergencyContactName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relationship</p>
                  <Badge variant="secondary" className="mt-1 capitalize text-xs">
                    {patient.emergencyContactRelationship}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.emergencyContactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LabelSubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}
