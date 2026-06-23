'use client';

import { useEffect, useRef, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { MedicineDto, MedicineResponseDto, CreateMedicineSchemaDto } from '@app/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, X, Loader2, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

type FormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  weight: string;
};

const initialFormState: FormState = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  weight: '',
};

export default function MedicationsPage() {
  // Inventory list state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<MedicineDto[]>([]);
  const [pagination, setPagination] = useState<MedicineResponseDto['pagination'] | null>(null);

  // Form state
  const [panelMode, setPanelMode] = useState<'none' | 'create' | 'edit'>('none');
  const [selectedMedication, setSelectedMedication] = useState<MedicineDto | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const lastAppliedSearchRef = useRef('');

  // Debounce search term
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load medications
  const fetchMedications = async () => {
    const filterChanged = lastAppliedSearchRef.current !== debouncedSearchQuery;

    if (filterChanged && page !== 1) {
      setPage(1);
      return;
    }

    try {
      if (filterChanged) {
        lastAppliedSearchRef.current = debouncedSearchQuery;
      }
      setIsLoading(true);
      const res = await api.get<MedicineResponseDto>('/medicines', {
        params: {
          name: debouncedSearchQuery,
          page,
          limit: 8,
        },
      });
      setMedications(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [debouncedSearchQuery, page]);

  // Handle panel toggle
  const openCreateMode = () => {
    setPanelMode('create');
    setSelectedMedication(null);
    setForm(initialFormState);
    setErrors({});
  };

  const openEditMode = (med: MedicineDto) => {
    setPanelMode('edit');
    setSelectedMedication(med);
    setForm({
      name: med.name,
      description: med.description ?? '',
      price: med.price.toString(),
      stockQuantity: med.stockQuantity.toString(),
      weight: med.weight?.toString() ?? '',
    });
    setErrors({});
  };

  const closePanel = () => {
    setPanelMode('none');
    setSelectedMedication(null);
    setForm(initialFormState);
    setErrors({});
  };

  // Form field inputs helper
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validations
    const localErrors: Record<string, string> = {};
    if (!form.name.trim()) localErrors.name = 'Name is required';
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      localErrors.price = 'Price must be a positive number';
    }
    if (!form.stockQuantity.trim() || isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0) {
      localErrors.stockQuantity = 'Quantity must be a non-negative integer';
    }
    if (form.weight.trim() && (isNaN(Number(form.weight)) || Number(form.weight) <= 0)) {
      localErrors.weight = 'Weight must be a positive number';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error('Validation Error', { description: 'Please check your inputs.' });
      return;
    }

    // Build payload
    const payload: CreateMedicineSchemaDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stockQuantity: Math.floor(Number(form.stockQuantity)),
      weight: form.weight.trim() ? Number(form.weight) : undefined,
    };

    setIsSubmitting(true);
    try {
      if (panelMode === 'create') {
        await api.post('/medicines', payload);
        toast.success('Medication added successfully');
      } else if (panelMode === 'edit' && selectedMedication) {
        await api.put(`/medicines/${selectedMedication.id}`, payload);
        toast.success('Medication updated successfully');
      }
      closePanel();
      fetchMedications();
    } catch (err) {
      handleClientError(err, { setErrors });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soft delete medication
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      await api.delete(`/medicines/${id}`);
      toast.success('Medication soft-deleted successfully');
      if (selectedMedication?.id === id) {
        closePanel();
      }
      fetchMedications();
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Medications Inventory
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Monitor stocks, register new drugs, and manage prescription costs.
          </p>
        </div>
        <Button onClick={openCreateMode} className="rounded-xl h-11 self-start sm:self-auto gap-2">
          <Plus className="size-4" />
          Add Medication
        </Button>
      </div>

      {/* Workspace Panel Split */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] items-start">
        {/* Left Side: Directory and List */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border py-4 px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medications by name..."
                className="h-10 rounded-xl pl-10 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && medications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground gap-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Querying medication directory...</p>
              </div>
            ) : medications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                  <ShoppingBag className="size-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Medications Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {searchTerm ? "No stock items match your current search criteria." : "Get started by adding your first medication to the stock inventory."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-6">Drug Details</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Stock</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Price</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => {
                      const isLowStock = med.stockQuantity <= 5;
                      const isOutOfStock = med.stockQuantity === 0;

                      return (
                        <TableRow
                          key={med.id}
                          className={`border-b border-border transition-colors hover:bg-muted/10 ${selectedMedication?.id === med.id ? 'bg-muted/20' : ''}`}
                        >
                          <TableCell className="py-4 pl-6">
                            <div>
                              <p className="font-bold text-foreground">{med.name}</p>
                              {med.weight && (
                                <p className="text-xs text-muted-foreground mt-0.5">{med.weight}g weight</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-semibold font-mono">{med.stockQuantity}</span>
                              {isOutOfStock ? (
                                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 mt-1 hover:bg-destructive/10 text-[10px] font-medium py-0 px-1">
                                  Out of Stock
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 mt-1 hover:bg-amber-500/10 text-[10px] font-medium py-0 px-1">
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mt-1 hover:bg-emerald-500/10 text-[10px] font-medium py-0 px-1">
                                  In Stock
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right font-bold font-mono text-sm text-foreground">
                            ${med.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => openEditMode(med)}
                                className="rounded-lg hover:border-primary/30"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                disabled={isDeletingId === med.id}
                                onClick={() => handleDelete(med.id, med.name)}
                                className="rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
                              >
                                {isDeletingId === med.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {pagination && (
                  <div className="flex items-center justify-between border-t border-border px-6 py-4">
                    <span className="text-xs text-muted-foreground font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={!pagination.hasPreviousPage || isLoading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={!pagination.hasNextPage || isLoading}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Create/Edit/Instructions Panel */}
        <div>
          {panelMode === 'none' ? (
            <Card className="border-border bg-card border-dashed p-10 flex flex-col items-center justify-center text-center h-[420px] justify-self-stretch">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-900 border border-border text-muted-foreground/60 mb-4 animate-bounce">
                <Sparkles className="size-6 text-primary/50" />
              </div>
              <h3 className="font-bold text-foreground text-base">Workspace Panel</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                Select a medication to edit details or click <span className="font-semibold text-foreground">Add Medication</span> above to add a new inventory entry.
              </p>
            </Card>
          ) : (
            <Card className="border-border bg-card animate-in slide-in-from-right-5 duration-200">
              <CardHeader className="border-b border-border flex flex-row items-center justify-between py-4 px-6">
                <div>
                  <CardTitle className="text-lg">
                    {panelMode === 'create' ? 'Add New Medication' : 'Modify Medication'}
                  </CardTitle>
                  <CardDescription>
                    {panelMode === 'create' ? 'Fill details to add drug to catalog.' : 'Update fields for stock item.'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={closePanel} className="rounded-lg">
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="py-6 px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medication Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Paracetamol 500mg"
                      value={form.name}
                      onChange={handleChange}
                      className="rounded-xl border-border h-11"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter drug indications or dosage limits"
                      value={form.description}
                      onChange={handleChange}
                      className="rounded-xl border-border min-h-[80px]"
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="text"
                        placeholder="12.50"
                        value={form.price}
                        onChange={handleChange}
                        className="rounded-xl border-border h-11"
                      />
                      {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                      <Input
                        id="stockQuantity"
                        name="stockQuantity"
                        type="text"
                        placeholder="100"
                        value={form.stockQuantity}
                        onChange={handleChange}
                        className="rounded-xl border-border h-11"
                      />
                      {errors.stockQuantity && <p className="text-xs text-destructive">{errors.stockQuantity}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (g)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="text"
                        placeholder="0.5"
                        value={form.weight}
                        onChange={handleChange}
                        className="rounded-xl border-border h-11"
                      />
                      {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border pt-4 mt-6">
                    <Button type="button" variant="outline" onClick={closePanel} className="rounded-xl h-11 px-5">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-5 gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{panelMode === 'create' ? 'Register Drug' : 'Save Changes'}</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
