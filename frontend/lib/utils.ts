import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function scoreColor(score: number | null, max: number = 10): string {
  if (!score) return 'text-gray-400'
  const pct = (score / max) * 10
  if (pct >= 7) return 'text-green-600'
  if (pct >= 5) return 'text-yellow-600'
  return 'text-red-600'
}

export function scoreToPercent(score: number | null, max: number): number {
  if (!score) return 0
  return Math.round((score / max) * 100)
}
