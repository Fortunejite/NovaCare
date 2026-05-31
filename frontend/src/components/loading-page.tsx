import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm rounded-[calc(var(--radius)*2)] border border-border bg-card p-5 text-center shadow-sm sm:p-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-muted/40 text-primary">
          <Loader2 className="size-6 animate-spin" />
        </div>

        <div className="mt-4 space-y-2">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Loading NovaCare</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Preparing your secure hospital workspace.
          </p>
        </div>
      </div>
    </main>
  );
}