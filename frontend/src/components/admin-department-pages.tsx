'use client';

import api, { handleClientError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { DepartmentDto } from '@app/shared';
import { ArrowLeft, ArrowRight, Eye, Loader2, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DepartmentFormValues = {
  name: string;
  description: string;
};

const initializeValues = (): DepartmentFormValues => ({
  name: '',
  description: '',
});

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return String(value);
};

export function DepartmentListPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadDepartments = async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDepartments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleDelete = async (department: DepartmentDto) => {
    const confirmed = window.confirm(`Delete ${department.name}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(department.id);

    try {
      await api.delete(`/admin/departments/${department.id}`);
      toast.success('Department deleted successfully');
      await loadDepartments();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Departments</CardTitle>
            <CardDescription>Manage hospital departments and descriptions.</CardDescription>
          </div>
          <Button type="button" size="sm" onClick={() => router.push('/admin/departments/new')}>
            <Plus className="size-4" />
            New department
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border hover:bg-muted/30">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Name</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Description</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Doctors</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-10 sm:px-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading departments
                  </div>
                </TableCell>
              </TableRow>
            ) : departments.length ? (
              departments.map((department) => (
                <TableRow key={department.id} className="align-top">
                  <TableCell className="px-4 py-4 sm:px-6">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{department.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-foreground">{department.description || 'No description'}</p>
                  </TableCell>
                  <TableCell className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-foreground">{department.doctorCount}</p>
                  </TableCell>
                  <TableCell className="px-4 py-4 sm:px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => router.push(`/admin/departments/${department.id}`)}
                        aria-label={`Open ${department.name} details`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => router.push(`/admin/departments/${department.id}/edit`)}
                        aria-label={`Edit ${department.name}`}
                      >
                        <PencilLine className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="rounded-full"
                        disabled={isDeleting === department.id}
                        onClick={() => void handleDelete(department)}
                        aria-label={`Delete ${department.name}`}
                      >
                        {isDeleting === department.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function DepartmentDetailsPage({ id }: { id: string }) {
  const router = useRouter();
  const [department, setDepartment] = useState<DepartmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loadDepartment = async () => {
        setIsLoading(true);

        try {
          const response = await api.get(`/admin/departments/${id}`);
          setDepartment(response.data);
        } catch (error) {
          handleClientError(error);
        } finally {
          setIsLoading(false);
        }
      };

      void loadDepartment();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [id]);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Department details</CardTitle>
            <CardDescription>Review and manage this department record.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/departments')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" onClick={() => router.push(`/admin/departments/${id}/edit`)}>
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
            Loading department
          </div>
        ) : department ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium text-foreground">{department.name}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Doctors</p>
              <p className="mt-1 text-sm font-medium text-foreground">{department.doctorCount}</p>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Description</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatValue(department.description)}</p>
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Department not available.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DepartmentFormPage({ mode, id }: { mode: 'new' | 'edit'; id?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<DepartmentFormValues>(initializeValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'new') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(initializeValues());
      setIsLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const loadDepartment = async () => {
        setIsLoading(true);

        try {
          const response = await api.get(`/admin/departments/${id}`);
          setValues({
            name: response.data.name ?? '',
            description: response.data.description ?? '',
          });
        } catch (error) {
          handleClientError(error);
        } finally {
          setIsLoading(false);
        }
      };

      void loadDepartment();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [id, mode]);

  const updateValue = (name: keyof DepartmentFormValues, value: string) => {
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
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      };

      if (mode === 'edit' && id) {
        await api.put(`/admin/departments/${id}`, payload);
        toast.success('Department updated successfully');
        router.push(`/admin/departments/${id}`);
      } else {
        const response = await api.post('/admin/departments', payload);
        toast.success('Department created successfully');
        router.push(`/admin/departments/${response.data.id}`);
      }
    } catch (error) {
      handleClientError(error, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading department form</div>;
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{mode === 'new' ? 'Create department' : 'Edit department'}</CardTitle>
            <CardDescription>Keep department names short and clear.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/departments')}>
            <ArrowLeft className="size-4" />
            Back to list
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Department name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateValue('name', event.target.value)}
                placeholder="Cardiology"
                aria-invalid={Boolean(errors.name)}
                className="mt-2 h-11 rounded-xl"
              />
              {errors.name ? <p className="mt-1.5 text-sm text-destructive">{errors.name}</p> : null}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(event) => updateValue('description', event.target.value)}
                placeholder="Optional short description"
                className="mt-2 min-h-28 rounded-xl"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? <p className="mt-1.5 text-sm text-destructive">{errors.description}</p> : null}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/departments')}>
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