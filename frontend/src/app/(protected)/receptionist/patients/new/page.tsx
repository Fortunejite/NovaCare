'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { handleClientError } from '@/lib/api';
import { CreatePatientDto, PatientDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

type FormValues = {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  genotype: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  maritalStatus: string;
  weight: string;
  height: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  allergies: string;
  medicalHistory: string;
  status: string;
  phoneNumber2?: string;
};

const initialForm: FormValues = {
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  bloodGroup: '',
  genotype: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  maritalStatus: 'single',
  weight: '',
  height: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  allergies: '',
  medicalHistory: '',
  status: 'active',
};

export default function RegisterPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    setErrors({});
    // Build payload with proper types
    const payload: CreatePatientDto = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      bloodGroup: form.bloodGroup,
      genotype: form.genotype,
      phoneNumber: form.phoneNumber,
      address: form.address,
      city: form.city,
      state: form.state,
      maritalStatus: form.maritalStatus as CreatePatientDto['maritalStatus'],
      weight: form.weight === '' ? 0 : Number(form.weight),
      height: form.height === '' ? 0 : Number(form.height),
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      emergencyContactRelationship: form.emergencyContactRelationship,
      allergies: form.allergies || undefined,
      medicalHistory: form.medicalHistory || undefined,
      status: form.status as CreatePatientDto['status'],
    } as CreatePatientDto;

    setIsSubmitting(true);
    try {
      const response = await api.post<PatientDto>('/patients', payload);
      toast.success('Patient registered');
      router.push(`/receptionist/patients/${response.data.id}`);
    } catch (err) {
      handleClientError(err, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Register patient</CardTitle>
          <CardDescription>Capture the basic details needed at the front desk.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-foreground">First name</label>
              <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last name</label>
              <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" name="email" value={form.email} onChange={handleChange} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">Phone</label>
              <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium text-foreground">Gender</label>
              <select name="gender" id="gender" value={form.gender} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="">Select</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">Date of birth</label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="maritalStatus" className="text-sm font-medium text-foreground">Marital status</label>
              <select name="maritalStatus" id="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="single">single</option>
                <option value="married">married</option>
                <option value="divorced">divorced</option>
                <option value="widowed">widowed</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="bloodGroup" className="text-sm font-medium text-foreground">Blood group</label>
              <Input id="bloodGroup" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="genotype" className="text-sm font-medium text-foreground">Genotype</label>
              <Input id="genotype" name="genotype" value={form.genotype} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">Status</label>
              <select name="status" id="status" value={form.status} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="active">active</option>
                <option value="admitted">admitted</option>
                <option value="discharged">discharged</option>
                <option value="deceased">deceased</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-foreground">Address</label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium text-foreground">City</label>
              <Input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium text-foreground">State</label>
              <Input id="state" name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber2" className="text-sm font-medium text-foreground">Alternative phone</label>
              <Input id="phoneNumber2" name="phoneNumber2" value={form.phoneNumber2 || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm font-medium text-foreground">Weight (kg)</label>
              <Input id="weight" name="weight" type="number" value={form.weight} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="height" className="text-sm font-medium text-foreground">Height (cm)</label>
              <Input id="height" name="height" type="number" value={form.height} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="emergencyContactName" className="text-sm font-medium text-foreground">Emergency contact</label>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input id="emergencyContactName" name="emergencyContactName" placeholder="Name" value={form.emergencyContactName} onChange={handleChange} />
              <Input id="emergencyContactPhone" name="emergencyContactPhone" placeholder="Phone" value={form.emergencyContactPhone} onChange={handleChange} />
              <Input id="emergencyContactRelationship" name="emergencyContactRelationship" placeholder="Relationship" value={form.emergencyContactRelationship} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="allergies" className="text-sm font-medium text-foreground">Allergies</label>
            <Input id="allergies" name="allergies" value={form.allergies} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label htmlFor="medicalHistory" className="text-sm font-medium text-foreground">Medical history</label>
            <Textarea id="medicalHistory" name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={4} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={handleSubmit} className="h-11 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save patient'}
            </Button>
            <Button asChild type="button" variant="outline" className="h-11 rounded-xl">
              <Link href="/receptionist/patients">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}