import { AlertCircle, Inbox } from 'lucide-react';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
      {label}
    </div>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      <Inbox className="h-5 w-5" />
      {message}
    </div>
  );
}
