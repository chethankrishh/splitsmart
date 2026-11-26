/** Returns today's ISO date string (YYYY-MM-DD). */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns the first day of the current month as an ISO date string. */
export function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

/** Format an ISO date string to a readable label, e.g. "26 Nov 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
