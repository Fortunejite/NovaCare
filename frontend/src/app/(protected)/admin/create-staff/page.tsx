'use client';

import { rolePathMap } from "@/components/admin-role-pages";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Stethoscope, Pill, ClipboardList, Microscope } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateStaffPage() {
  const router = useRouter();

  const options = [
    { role: 'doctor' as const, title: 'Doctor', description: 'Clinical staff and specialists.', icon: Stethoscope },
    { role: 'pharmacist' as const, title: 'Pharmacist', description: 'Pharmacy and medication staff.', icon: Pill },
    { role: 'receptionist' as const, title: 'Receptionist', description: 'Front desk and patient intake.', icon: ClipboardList },
    { role: 'labTechnician' as const, title: 'Lab technician', description: 'Diagnostics and lab operations.', icon: Microscope },
  ];

  return (
    <Card>
      <CardHeader className="border-b border-border py-4">
        <CardTitle className="text-lg">Create staff</CardTitle>
        <CardDescription>Select the staff role you want to create.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {options.map((option) => (
            <Button
              key={option.role}
              type="button"
              variant="outline"
              className="h-auto justify-start rounded-2xl border-border p-4 text-left"
              onClick={() => router.push(`/admin/${rolePathMap[option.role]}/new`)}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <option.icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{option.title}</p>
                  <p className="text-sm font-normal text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}