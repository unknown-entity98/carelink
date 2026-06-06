interface AlertBadgeProps {
  hasCritical: boolean
  className?: string
}

export default function AlertBadge({ hasCritical, className = '' }: AlertBadgeProps) {
  if (!hasCritical) {
    return (
      <span
        aria-label="No critical alerts"
        className={`inline-block w-3 h-3 rounded-full bg-emerald-400 ${className}`}
      />
    )
  }
  return (
    <span
      aria-label="Has critical alerts"
      className={`inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse ${className}`}
    />
  )
}
