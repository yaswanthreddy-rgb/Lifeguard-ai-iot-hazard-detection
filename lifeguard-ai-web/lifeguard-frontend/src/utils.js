export const ALERT_TEXT = {
  FIRE: 'Flame detected',
  GAS: 'Gas or smoke above limit',
  HEAT: 'Temperature above limit',
}

export function parseAlerts(value) {
  return value ? value.split(',').filter(Boolean) : []
}

export function ago(ms) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  return `${Math.floor(m / 60)} h ago`
}

export function clock(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
