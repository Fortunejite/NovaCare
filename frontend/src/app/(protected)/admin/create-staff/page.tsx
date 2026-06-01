'use client';

import { rolePathMap } from '@/components/admin-role-pages';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ClipboardList, Microscope, Pill, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function CreateStaffPage() {
  const options = [
    { role: 'doctor' as const, title: 'Doctor', description: 'Clinical staff and specialists.', icon: Stethoscope, accent: 'Care teams' },
    { role: 'pharmacist' as const, title: 'Pharmacist', description: 'Pharmacy and medication staff.', icon: Pill, accent: 'Medication' },
    { role: 'receptionist' as const, title: 'Receptionist', description: 'Front desk and patient intake.', icon: ClipboardList, accent: 'Front desk' },
    { role: 'labTechnician' as const, title: 'Lab technician', description: 'Diagnostics and lab operations.', icon: Microscope, accent: 'Diagnostics' },
  ];

  return (
    <div className="space-y-6">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Create staff</CardTitle>
              <CardDescription>Choose a role to open the matching onboarding form.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {options.map((option) => (
              <Link
                key={option.role}
                href={`/admin/${rolePathMap[option.role]}/new`}
                className="group block"
              >
                <Card className="h-full gap-0 py-0 transition-colors group-hover:border-primary/40 group-hover:bg-muted/20">
                  <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <option.icon className="size-5" />
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {option.accent}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">{option.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{option.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-medium text-primary">
                      <span>Open form</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}