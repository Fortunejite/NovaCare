'use client';
import Link from "next/link";
import { ArrowRight, Building2, Loader2, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoginUserDto } from "@app/shared";
import api, { handleClientError } from "@/lib/api";

export default function LoginPage() {
  const [loginData, setLoginData] = useState<LoginUserDto>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => {
      if (!(name in prev)) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const res = await api.post('/auth/login', loginData);
      console.log(res.data)
    } catch (error) {
      handleClientError(error, { setErrors })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 space-y-6 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="size-3.5 text-primary" />
            Secure hospital access
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">NovaCare</p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              One login for clinical, pharmacy, and administrative workflows.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Sign in to manage appointments, patient records, departments, and operational handoffs from a single,
              clean dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Building2, title: "Departments", text: "Keep units aligned with shared workflows." },
              { icon: Stethoscope, title: "Care teams", text: "Move faster between doctors, nurses, and staff." },
              { icon: ShieldCheck, title: "Protected data", text: "Built for secure access on small screens first." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="rounded-[calc(var(--radius)*2)] border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h2>
              <p className="text-sm leading-6 text-muted-foreground">Use your hospital credentials to continue.</p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  type="email"
                  autoComplete="email"
                  placeholder="name@hospital.org"
                  aria-invalid={Boolean(errors.email)}
                  className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                />
                {errors.email ? <p className="mt-1.5 text-sm text-destructive">{errors.email}</p> : null}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                />
                {errors.password ? <p className="mt-1.5 text-sm text-destructive">{errors.password}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleInputChange}
                    className="size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                  Remember this device
                </label>
                <span className="text-xs text-muted-foreground">Mobile-first secure access</span>
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm leading-6 text-muted-foreground">
                New staff accounts are set up by administration.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
