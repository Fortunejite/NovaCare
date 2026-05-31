'use client';

import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api, { handleClientError } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage(response.data.message || 'Your password has been updated.');
      setNewPassword("");
      setConfirmPassword("");
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
              <ShieldCheck className="size-4" />
              Secure password reset
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create a new password</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter the reset token from your email and set a new password for your account.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="token" className="text-sm font-medium text-foreground">
                Reset token
              </label>
              <input
                id="token"
                name="token"
                value={token}
                readOnly
                autoComplete="off"
                aria-invalid={Boolean(errors.token)}
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              />
              {errors.token ? <p className="mt-1.5 text-sm text-destructive">{errors.token}</p> : null}
            </div>

            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setErrors((prev) => {
                    if (!prev.newPassword) {
                      return prev;
                    }

                    const nextErrors = { ...prev };
                    delete nextErrors.newPassword;
                    return nextErrors;
                  });
                }}
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                aria-invalid={Boolean(errors.newPassword)}
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              />
              {errors.newPassword ? <p className="mt-1.5 text-sm text-destructive">{errors.newPassword}</p> : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors((prev) => {
                    if (!prev.confirmPassword) {
                      return prev;
                    }

                    const nextErrors = { ...prev };
                    delete nextErrors.confirmPassword;
                    return nextErrors;
                  });
                }}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat the new password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              />
              {errors.confirmPassword ? <p className="mt-1.5 text-sm text-destructive">{errors.confirmPassword}</p> : null}
            </div>

            {message ? <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">{message}</p> : null}

            <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating password
                </>
              ) : (
                'Update password'
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