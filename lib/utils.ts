export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function titleCase(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatInteger(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}
