import { cn } from '@/lib/utils'

// ── Badge ──────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-indigo-100 text-indigo-700',
  outline: 'border border-gray-300 text-gray-600 bg-white',
}

export function Badge({ children, variant = 'default', className }: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', badgeStyles[variant], className)}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-b border-gray-50', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-gray-900', className)}>{children}</h3>
}

// ── Button ──────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:   'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  ghost:     'hover:bg-gray-100 text-gray-700',
  outline:   'border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ children, variant = 'primary', size = 'md', className, onClick, disabled, type = 'button' }: {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
    >
      {children}
    </button>
  )
}

// ── ScoreBadge ──────────────────────────────────────────────
export function ScoreBadge({ score, max = 10 }: { score: number | null; max?: number }) {
  if (score === null || score === undefined) return <span className="text-gray-400 text-sm">—</span>
  const pct = (score / max) * 10
  const variant = pct >= 7 ? 'success' : pct >= 5 ? 'warning' : 'danger'
  return <Badge variant={variant}>{score.toFixed(1)} / {max}</Badge>
}

// ── StatusBadge ──────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    pending:    'warning',
    approved:   'success',
    partial:    'info',
    rejected:   'danger',
    dispatched: 'success',
    open:       'danger',
    acknowledged: 'warning',
    resolved:   'success',
    scheduled:  'info',
    initiated:  'info',
    connected:  'info',
    completed:  'success',
    no_answer:  'warning',
    failed:     'danger',
  }
  return <Badge variant={map[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>
}
