'use client';

import { useEffect, useState } from 'react';
import api, { handleClientError } from '@/lib/api';
import { LabTechnicianSummaryDto } from '@app/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LabTechnicianDashboard() {
  const [summary, setSummary] = useState<LabTechnicianSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<LabTechnicianSummaryDto>('/summary/lab-technician');
      setSummary(res.data);
    } catch (err) {
      handleClientError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold">Technician Dashboard</h2>
        <p className="text-muted-foreground">Overview of lab workload and pending requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="text-sm">Total Lab Requests</CardHeader>
          <CardContent className="text-2xl font-bold">{isLoading ? '...' : summary?.totalLabRequests ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm">Completed By Me</CardHeader>
          <CardContent className="text-2xl font-bold">{isLoading ? '...' : summary?.totalCompletedByMe ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm">Pending Assigned</CardHeader>
          <CardContent className="text-2xl font-bold">{isLoading ? '...' : summary?.totalPendingAssignedToMe ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm">Pending Unassigned</CardHeader>
          <CardContent className="text-2xl font-bold">{isLoading ? '...' : summary?.totalPendingUnassigned ?? 0}</CardContent>
        </Card>
      </div>
    </div>
  );
}
