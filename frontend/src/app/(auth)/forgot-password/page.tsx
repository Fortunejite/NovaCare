'use client';

import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import api, { handleClientError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'If an account exists, a reset link has been sent.');
    } catch (error) {
      handleClientError(error, { setErrors, setErrorMsg: setMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <section className="w-full rounded-[calc(var(--radius)*2)] border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Mail className="size-4" />
              Password recovery
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot your password?</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter your hospital email address and we’ll send a reset link if the account exists.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {message ? <p className="rounded-xl border border-border bg-background text-foreground px-3 py-2 text-sm text-success">{message}</p> : null}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((prev) => {
                    if (!prev.email) {
                      return prev;
                    }

                    const nextErrors = { ...prev };
                    delete nextErrors.email;
                    return nextErrors;
                  });
                }}
                type="email"
                autoComplete="email"
                placeholder="name@hospital.org"
                aria-invalid={Boolean(errors.email)}
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              />
              {errors.email ? <p className="mt-1.5 text-sm text-destructive">{errors.email}</p> : null}
            </div>

            <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending link
                </>
              ) : (
                'Send reset link'
              )}
            </Button>

            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}