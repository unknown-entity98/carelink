export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(datetime: string | null | undefined): string {
  if (!datetime) return '—'
  return new Date(datetime).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getAvatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'life_threatening': return 'text-red-700 bg-red-50 border-red-200'
    case 'serious': return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'mild': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    default: return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export function moodLabel(rating: number | null): string {
  if (!rating) return '—'
  const labels = ['', 'Very low', 'Low', 'Neutral', 'Good', 'Great']
  return labels[rating] ?? '—'
}
