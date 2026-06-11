 'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

export default function ReceptionistDashboard() {
	return (
		<div className="mx-auto flex w-full flex-col gap-6">
			<Card className="gap-0 py-0">
				<CardHeader className="border-b border-border py-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle className="text-lg">Reception dashboard</CardTitle>
							<CardDescription>Search patients or register a new one from here.</CardDescription>
						</div>
						<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="size-4" />
							Front desk workspace
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 py-6">
					<div className="grid gap-4 lg:grid-cols-[1fr_auto]">
						<div className="space-y-2">
							<label htmlFor="patient-search" className="text-sm font-medium text-foreground">
								Search Patient
							</label>
							<div className="flex flex-col gap-3 sm:flex-row">
								<div className="relative flex-1">
									<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="patient-search"
										type="search"
										placeholder="Search by name or patient ID"
										className="h-11 rounded-xl pl-9"
									/>
								</div>
								<Button type="button" className="h-11 rounded-xl sm:w-auto">
									Search
									<ArrowRight className="size-4" />
								</Button>
							</div>
						</div>

						<div className="flex items-end">
							<Button asChild type="button" className="h-11 w-full rounded-xl lg:w-auto">
								<Link href="/receptionist/patients/new">
									<UserPlus className="size-4" />
									Register patient
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
