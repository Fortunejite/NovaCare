import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'string' && /T|Z/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  return String(value);
};

export const formatLabel = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());