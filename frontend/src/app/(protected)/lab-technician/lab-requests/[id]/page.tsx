'use client';

import { useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianLabRequestDto } from '@app/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useParams, useRouter } from 'next/navigation';

export default function LabRequestDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<LabTechnicianLabRequestDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [resultText, setResultText] = useState('');
  const router = useRouter();

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<LabTechnicianLabRequestDto>(`/lab-requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const generate = async () => {
    try {
      await api.post(`/lab-requests/${id}/result`, { result: resultText });
      setOpenConfirm(false);
      router.push('/lab-technician/lab-requests');
    } catch (err) {
      handleClientError(err);
    }
  };

  if (!request && loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lab Request</h2>
        <p className="text-muted-foreground">Process and generate lab result.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{request?.patientName}</div>
            <div className="text-xs text-muted-foreground">Test: {request?.testType}</div>
          </div>
          <div className="text-sm">Status: {request?.status}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Result</label>
              <Textarea value={resultText} onChange={(e) => setResultText(e.target.value)} placeholder="Enter result details here" />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setOpenConfirm(true)}>Generate Result</Button>
              <Button variant="outline" onClick={() => router.back()}>Back</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog open={openConfirm} title="Generate lab result" description="This will mark the request as completed and save the result. Proceed?" confirmLabel="Generate" cancelLabel="Cancel" onConfirm={generate} onCancel={() => setOpenConfirm(false)} />
    </div>
  );
}
