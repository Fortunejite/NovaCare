'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { handleClientError } from '@/lib/api';
import { CreatePatientDto, PatientDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Calendar,
  Heart,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Dna,
  Scale,
  Ruler,
  Loader2,
} from 'lucide-react';

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

    // Validate inputs locally before sending
    const localErrors: Record<string, string> = {};
    if (!form.firstName) localErrors.firstName = 'First name is required';
    if (!form.lastName) localErrors.lastName = 'Last name is required';
    if (!form.email) localErrors.email = 'Email address is required';
    if (!form.phoneNumber) localErrors.phoneNumber = 'Phone number is required';
    if (!form.gender) localErrors.gender = 'Gender is required';
    if (!form.dateOfBirth) localErrors.dateOfBirth = 'Date of birth is required';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error('Validation Error', { description: 'Please fill in all required fields.' });
      return;
    }

    // Build payload with proper types
    const payload: CreatePatientDto = {
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dateOfBirth: new Date(form.dateOfBirth),
      bloodGroup: form.bloodGroup.trim(),
      genotype: form.genotype.trim(),
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      maritalStatus: form.maritalStatus as CreatePatientDto['maritalStatus'],
      weight: form.weight === '' ? 0 : Number(form.weight),
      height: form.height === '' ? 0 : Number(form.height),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
      emergencyContactRelationship: form.emergencyContactRelationship.trim(),
      allergies: form.allergies.trim() || undefined,
      medicalHistory: form.medicalHistory.trim() || undefined,
      status: form.status as CreatePatientDto['status'],
    };

    setIsSubmitting(true);
    try {
      const response = await api.post<PatientDto>('/patients', payload);
      toast.success('Patient registered successfully');
      router.push(`/receptionist/patients/${response.data.id}`);
    } catch (err) {
      handleClientError(err, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Register New Patient</CardTitle>
              <CardDescription>Capture details needed to intake a new patient record.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 self-start sm:self-auto"
              onClick={() => router.push('/receptionist')}
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <User className="size-4" />
                <h2>Personal Information</h2>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="e.g. +1234567890"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val) => handleSelectChange('gender', val)}
                  >
                    <SelectTrigger id="gender" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={form.maritalStatus}
                    onValueChange={(val) => handleSelectChange('maritalStatus', val)}
                  >
                    <SelectTrigger id="maritalStatus" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <HeartPulse className="size-4" />
                <h2>Vitals & Clinical Attributes</h2>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input
                    id="bloodGroup"
                    name="bloodGroup"
                    placeholder="e.g. O+"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.bloodGroup && <p className="text-sm text-destructive">{errors.bloodGroup}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genotype">Genotype</Label>
                  <Input
                    id="genotype"
                    name="genotype"
                    placeholder="e.g. AA"
                    value={form.genotype}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.genotype && <p className="text-sm text-destructive">{errors.genotype}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Patient Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => handleSelectChange('status', val)}
                  >
                    <SelectTrigger id="status" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="admitted">Admitted</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1.5">
                    <Scale className="size-4 text-muted-foreground" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="Weight in kg"
                    value={form.weight}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-1.5">
                    <Ruler className="size-4 text-muted-foreground" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="Height in cm"
                    value={form.height}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="flex items-center gap-1.5">
                  <ShieldAlert className="size-4 text-muted-foreground" />
                  Allergies
                </Label>
                <Input
                  id="allergies"
                  name="allergies"
                  placeholder="Specify food, drug, or other allergies (if any)"
                  value={form.allergies}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
                {errors.allergies && <p className="text-sm text-destructive">{errors.allergies}</p>}
              </div>
            </div>

            {/* Section 3: Contact & Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <MapPin className="size-4" />
                <h2>Contact & Address Details</h2>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="address">Home Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street details"
                  value={form.address}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Emergency Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <ShieldAlert className="size-4" />
                <h2>Emergency Contact Details</h2>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    placeholder="Contact full name"
                    value={form.emergencyContactName}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-sm text-destructive">{errors.emergencyContactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    placeholder="Contact phone number"
                    value={form.emergencyContactPhone}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-destructive">{errors.emergencyContactPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    placeholder="e.g. Spouse, Sibling"
                    value={form.emergencyContactRelationship}
                    onChange={handleChange}
                    className="h-11 rounded-xl"
                  />
                  {errors.emergencyContactRelationship && (
                    <p className="text-sm text-destructive">{errors.emergencyContactRelationship}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Medical History */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <HeartPulse className="size-4" />
                <h2>Medical History</h2>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Prior Conditions & Records</Label>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  placeholder="Record patient medical history, surgeries, chronic diseases, family conditions, etc."
                  value={form.medicalHistory}
                  onChange={handleChange}
                  rows={4}
                  className="rounded-xl min-h-24"
                />
                {errors.medicalHistory && <p className="text-sm text-destructive">{errors.medicalHistory}</p>}
              </div>
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6"
                onClick={() => router.push('/receptionist')}
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
                    Registering...
                  </>
                ) : (
                  <>
                    Register Patient
                    <ArrowRight className="ml-2 size-4" />
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