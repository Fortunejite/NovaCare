import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from 'lucide-react';

const careTeams = [
  { label: 'Doctors', icon: Stethoscope, text: 'Appointments, consultations, lab requests, and prescriptions.' },
  { label: 'Pharmacists', icon: Pill, text: 'Prescription dispensing, medication stock, and inventory visibility.' },
  { label: 'Lab Teams', icon: FlaskConical, text: 'Lab queues, results, and request status across the care path.' },
  { label: 'Reception', icon: CalendarCheck, text: 'Patient records, scheduling, and front-desk coordination.' },
];

const metrics = [
  { value: '4', label: 'Connected care desks' },
  { value: '24/7', label: 'Operational visibility' },
  { value: '1', label: 'Patient-centered workflow' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        className="relative isolate min-h-screen overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=2400&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/52" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.86)_0%,rgba(15,23,42,0.68)_43%,rgba(15,23,42,0.18)_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/25 bg-white/12 backdrop-blur">
              <HeartPulse className="size-5" />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight">NovaCare</span>
              <span className="block text-xs text-white/72">Hospital Management</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/25 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-white/90"
          >
            Staff Login
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(84svh-80px)] w-full max-w-7xl items-center px-5 pb-14 pt-8 sm:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
              NovaCare
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86 sm:text-xl">
              A focused hospital operations platform for doctors, pharmacists, lab technicians, receptionists, and administrators.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-200"
              >
                Enter Workspace
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#care-flow"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16"
              >
                Explore Care Flow
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="border-l border-white/24 pl-4">
                  <p className="text-2xl font-extrabold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs font-medium text-white/68">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="care-flow" className="bg-white px-5 py-12 dark:bg-zinc-950 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Connected Care Flow</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-normal text-foreground sm:text-4xl">
                Every department sees the next step.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              NovaCare keeps patient movement, prescriptions, lab work, and front-desk tasks aligned inside one calm workspace.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {careTeams.map((team) => (
              <div key={team.label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <team.icon className="size-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{team.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{team.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Live operational awareness</h3>
                  <p className="text-sm text-muted-foreground">Appointments, labs, and prescriptions stay visible as work moves.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <ClipboardList className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Cleaner handoffs</h3>
                  <p className="text-sm text-muted-foreground">Each role works from a dedicated portal built around daily tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
