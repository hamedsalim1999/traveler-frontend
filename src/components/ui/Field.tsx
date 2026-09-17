import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function TextInput({
  icon: Icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon }) {
  if (!Icon) {
    return <input {...props} className={cn(fieldClass, className)} />;
  }
  return (
    <div className={cn('relative', className)}>
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input {...props} className={cn(fieldClass, 'pl-9')} />
    </div>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClass, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, props.className)} />;
}
