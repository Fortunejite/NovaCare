'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api, { handleClientError } from '@/lib/api';
import { PrescriptionPharmacistDetails } from '@app/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Label } from '@/components/ui/label';

export default function PrescriptionDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [prescription, setPrescription] = useState<PrescriptionPharmacistDetails | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<PrescriptionPharmacistDetails>(`/prescriptions/${id}`);
      setPrescription(res.data);
      const initial: Record<string, number> = {};
      res.data.prescribedItems.forEach((it) => (initial[it.id] = it.quantity || 1));
      setQuantities(initial);
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleQty = (itemId: string, value: number) => {
    setQuantities((s) => ({ ...s, [itemId]: Math.max(1, value) }));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDispense = async () => {
    if (!prescription) return;

    const dispensedItems = prescription.prescribedItems.map((it) => ({ itemId: it.id, quantity: quantities[it.id] || 1 }));

    setIsSubmitting(true);
    try {
      await api.post(`/prescriptions/${id}/dispense`, { dispensedItems });
      toast.success('Prescription dispensed');
      router.push('/pharmacist/prescriptions');
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!prescription) return <div className="p-6">Prescription not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold">Prescription for {prescription.patientName}</h2>
        <p className="text-sm text-muted-foreground">Prescribed on {new Date(prescription.consultationDate).toLocaleString()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescribed items</CardTitle>
          <CardDescription>Adjust quantities below before dispensing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prescription.prescribedItems.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{it.medicationName}</div>
                <div className="text-sm text-muted-foreground">{it.dosage} • {it.frequency} • {it.duration}</div>
              </div>
              <div className="w-40">
                <Label htmlFor={`qty-${it.id}`} className="mb-1">Quantity to dispense</Label>
                <Input
                  id={`qty-${it.id}`}
                  type="number"
                  min={1}
                  value={quantities[it.id] ?? 1}
                  onChange={(e) => handleQty(it.id, Number(e.target.value))}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            {prescription.status !== 'dispensed' && 
            <Button onClick={() => setConfirmOpen(true)} disabled={isSubmitting} className="h-10">
              {isSubmitting ? 'Dispensing...' : 'Dispense prescription'}
            </Button>
}
            <Button variant="outline" onClick={() => router.back()} className="h-10">Back</Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        title="Dispense prescription"
        description="This will decrement stock for each item. Proceed?"
        confirmLabel="Dispense"
        cancelLabel="Cancel"
        onConfirm={handleDispense}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
