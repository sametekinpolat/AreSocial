import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a karma number for display.
 * 999 → "999"  |  1250 → "1.2k"  |  15400 → "15.4k"  |  1500000 → "1.5m"
 */
export function formatKarma(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs < 1_000) return String(n);
  if (abs < 1_000_000) return `${sign}${Math.floor(abs / 100) / 10}k`;
  return `${sign}${Math.floor(abs / 100_000) / 10}m`;
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "post";
}
