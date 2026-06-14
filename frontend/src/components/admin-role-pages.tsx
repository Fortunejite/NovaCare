'use client';

import api, { handleClientError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import LoadingPage from '@/components/loading-page';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Loader2,
  PencilLine,
  Plus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DepartmentDto,
  DoctorDto,
  LabTechnicianDto,
  PagedResponse,
  PharmacistDto,
  ReceptionistDto,
} from '@app/shared';
import { formatLabel, formatValue } from '@/lib/utils';

export type RoleKey = 'doctor' | 'pharmacist' | 'receptionist' | 'labTechnician';
type RoleRoute = 'doctors' | 'pharmacists' | 'receptionists' | 'lab-technicians';
type RoleRecord = DoctorDto | PharmacistDto | ReceptionistDto | LabTechnicianDto;
type RoleListResponse = PagedResponse<RoleRecord>;
type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'datetime-local';

type FieldDefinition = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  step?: string;
  options?: Array<{ label: string; value: string }>;
};

type RoleConfig = {
  singular: string;
  plural: string;
  description: string;
  summaryLabel: string;
  listValue: (record: RoleRecord) => string;
  fields: FieldDefinition[];
};

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const rolePathMap: Record<RoleKey, RoleRoute> = {
  doctor: 'doctors',
  pharmacist: 'pharmacists',
  receptionist: 'receptionists',
  labTechnician: 'lab-technicians',
};

const roleConfigs: Record<RoleKey, RoleConfig> = {
  doctor: {
    singular: 'Doctor',
    plural: 'Doctors',
    description: 'Manage clinical staff profiles and departments.',
    summaryLabel: 'Department',
    listValue: (record) => (record as DoctorDto).departmentName || 'No department',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', placeholder: 'John' },
      { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Doe' },
      { name: 'email', label: 'Email address', type: 'text', placeholder: 'name@hospital.org' },
      { name: 'departmentId', label: 'Department', type: 'select' },
      { name: 'phoneNumber', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state' },
      { name: 'consultationFee', label: 'Consultation fee ($)', type: 'number', placeholder: '0.00', step: '0.01' },
      { name: 'yearsOfExperience', label: 'Years of experience', type: 'number', placeholder: '0', step: '1' },
      { name: 'licenseNumber', label: 'License number', type: 'text', placeholder: 'MD-00001' },
    ],
  },
  pharmacist: {
    singular: 'Pharmacist',
    plural: 'Pharmacists',
    description: 'Manage pharmacy staff profiles and credentials.',
    summaryLabel: 'Qualification',
    listValue: (record) => (record as PharmacistDto).qualification || 'No qualification',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Jane' },
      { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Smith' },
      { name: 'email', label: 'Email address', type: 'text', placeholder: 'name@hospital.org' },
      { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
      { name: 'phoneNumber', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state' },
      { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'B.Pharm' },
      { name: 'licenseNumber', label: 'License number', type: 'text', placeholder: 'PH-00001' },
    ],
  },
  receptionist: {
    singular: 'Receptionist',
    plural: 'Receptionists',
    description: 'Manage front desk staff profiles and contact details.',
    summaryLabel: 'Phone',
    listValue: (record) => record.phoneNumber || 'No phone number',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Jane' },
      { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Smith' },
      { name: 'email', label: 'Email address', type: 'text', placeholder: 'name@hospital.org' },
      { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
      { name: 'phoneNumber', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state' },
      { name: 'dateOfBirth', label: 'Date of birth', type: 'datetime-local' },
    ],
  },
  labTechnician: {
    singular: 'Lab technician',
    plural: 'Lab technicians',
    description: 'Manage laboratory staff profiles and qualifications.',
    summaryLabel: 'Qualification',
    listValue: (record) => (record as LabTechnicianDto).qualification || 'No qualification',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Jane' },
      { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Smith' },
      { name: 'email', label: 'Email address', type: 'text', placeholder: 'name@hospital.org' },
      { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
      { name: 'phoneNumber', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state' },
      { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'BMLS' },
    ],
  },
};

const formatName = (record: { firstName?: string | null; lastName?: string | null }) => {
  const fullName = `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim();
  return fullName || 'Unnamed staff';
};

const toFormDateTime = (value: unknown) => {
  if (!value) {
    return '';
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const initializeValues = (fields: FieldDefinition[]) =>
  fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.name] = '';
    return accumulator;
  }, {});

const mapIncomingValue = (field: FieldDefinition, value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (field.type === 'datetime-local') {
    return toFormDateTime(value);
  }

  return String(value);
};

const buildPayload = (fields: FieldDefinition[], values: Record<string, string>) => {
  const payload: Record<string, unknown> = {};

  fields.forEach((field) => {
    const rawValue = values[field.name]?.trim();

    if (!rawValue) {
      return;
    }

    if (field.type === 'number') {
      payload[field.name] = Number(rawValue);
      return;
    }

    if (field.type === 'datetime-local') {
      payload[field.name] = new Date(rawValue).toISOString();
      return;
    }

    payload[field.name] = rawValue;
  });

  return payload;
};

export function RoleListPage({ role }: { role: RoleKey }) {
  const router = useRouter();
  const config = roleConfigs[role];
  const [response, setResponse] = useState<RoleListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadData = useCallback(async (targetPage: number) => {
    setIsLoading(true);

    try {
      const result = await api.get(`/${rolePathMap[role]}`, {
        params: { page: targetPage, limit },
      });

      setResponse(result.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData, page]);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{config.plural}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              {response?.pagination.total ?? 0} records
            </div>
            <Button type="button" size="sm" onClick={() => router.push(`/admin/${rolePathMap[role]}/new`)}>
              <Plus className="size-4" />
              New {config.singular}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border hover:bg-muted/30">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                Name
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                Email
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                {config.summaryLabel}
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-10 sm:px-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading {config.plural.toLowerCase()}
                  </div>
                </TableCell>
              </TableRow>
            ) : response?.data?.length ? (
              response.data.map((record) => {
                const id = 'id' in record ? record.id : '';
                const name = formatName(record as { firstName?: string | null; lastName?: string | null });

                return (
                  <TableRow key={id} className="align-top">
                    <TableCell className="px-4 py-4 sm:px-6">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-foreground">{'email' in record ? record.email : '—'}</p>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-foreground">{config.listValue(record)}</p>
                    </TableCell>
                    <TableCell className="px-4 py-4 sm:px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-full"
                          onClick={() => router.push(`/admin/${rolePathMap[role]}/${id}`)}
                          aria-label={`Open ${name} details`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-sm"
                          className="rounded-full"
                          onClick={() => router.push(`/admin/${rolePathMap[role]}/${id}/edit`)}
                          aria-label={`Edit ${name}`}
                        >
                          <PencilLine className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                  No {config.plural.toLowerCase()} found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted-foreground">
          Page {response?.pagination.page ?? page} of {response?.pagination.totalPages ?? 1}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!response?.pagination.hasPreviousPage || isLoading}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!response?.pagination.hasNextPage || isLoading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function RoleDetailsPage({ role, id }: { role: RoleKey; id: string }) {
  const router = useRouter();
  const config = roleConfigs[role];
  const [record, setRecord] = useState<RoleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loadData = async () => {
        setIsLoading(true);

        try {
          const result = await api.get(`/${rolePathMap[role]}/${id}`);
          setRecord(result.data);
        } catch (error) {
          handleClientError(error);
        } finally {
          setIsLoading(false);
        }
      };

      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [id, role]);

  const details = useMemo(() => {
    if (!record) {
      return [] as Array<[string, unknown]>;
    }

    return Object.entries(record).filter(([key]) => key !== 'id' && key !== 'userId' && key !== 'departmentId');
  }, [record]);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{config.singular} details</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/${rolePathMap[role]}`)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" onClick={() => router.push(`/admin/${rolePathMap[role]}/${id}/edit`)}>
              <PencilLine className="size-4" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading profile
          </div>
        ) : record ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-border bg-muted/20 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{formatLabel(key)}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Profile not available.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function RoleFormPage({ role, mode, id }: { role: RoleKey; mode: 'new' | 'edit'; id?: string }) {
  const router = useRouter();
  const config = roleConfigs[role];
  const [values, setValues] = useState<Record<string, string>>(initializeValues(config.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadForm = useCallback(async () => {
    setIsLoading(true);

    try {
      if (role === 'doctor') {
        const departmentsResult = await api.get('/departments');
        setDepartments(departmentsResult.data);
      }

      if (mode === 'edit' && id) {
        const result = await api.get(`/${rolePathMap[role]}/${id}`);
        const nextValues = initializeValues(config.fields);

        config.fields.forEach((field) => {
          nextValues[field.name] = mapIncomingValue(field, (result.data as Record<string, unknown>)[field.name]);
        });

        setValues(nextValues);
      }
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, mode, role, config.fields]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadForm();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [id, loadForm, mode, role]);

  const updateField = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = buildPayload(config.fields, values);
      const endpoint = `/${rolePathMap[role]}`;

      if (mode === 'edit' && id) {
        await api.put(`${endpoint}/${id}`, payload);
        toast.success(`${config.singular} updated successfully`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${config.singular} created successfully`);
      }

      router.push(endpoint);
    } catch (error) {
      handleClientError(error, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{mode === 'new' ? `Create ${config.singular}` : `Edit ${config.singular}`}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/${rolePathMap[role]}`)}>
            <ArrowLeft className="size-4" />
            Back to list
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => {
              const fieldError = errors[field.name];

              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={values[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      aria-invalid={Boolean(fieldError)}
                      className="mt-2 min-h-28 rounded-xl"
                    />
                    {fieldError ? <p className="mt-1.5 text-sm text-destructive">{fieldError}</p> : null}
                  </div>
                );
              }

              if (field.type === 'select') {
                const options = field.name === 'departmentId' ? departments.map((department) => ({ label: department.name, value: department.id })) : field.options ?? [];

                return (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Select value={values[field.name]} onValueChange={(value) => updateField(field.name, value)}>
                      <SelectTrigger id={field.name} className="mt-2 w-full rounded-xl">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError ? <p className="mt-1.5 text-sm text-destructive">{fieldError}</p> : null}
                  </div>
                );
              }

              const inputType = field.type === 'number' ? 'number' : field.type === 'datetime-local' ? 'datetime-local' : 'text';

              return (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={inputType}
                    step={field.step}
                    value={values[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(fieldError)}
                    className="mt-2 h-11 rounded-xl"
                  />
                  {fieldError ? <p className="mt-1.5 text-sm text-destructive">{fieldError}</p> : null}
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/${rolePathMap[role]}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === 'new' ? 'Creating' : 'Saving'}
                </>
              ) : (
                <>
                  {mode === 'new' ? 'Create' : 'Save changes'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { rolePathMap };