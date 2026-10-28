import { ALERT_TEXT, parseAlerts, ago } from '../utils'

export default function StatusBand({ latest, online, stale, now, compact = false }) {
  let tone = 'idle'
  let title
  let detail

  if (!online) {
    title = "Can't reach the server"
    detail = 'Start the Spring Boot backend on port 8080. This page reconnects by itself.'
  } else if (!latest) {
    title = 'Waiting for the first reading'
    detail = 'Power on the ESP32, or press Send test reading below.'
  } else {
    const age = now - new Date(latest.createdAt).getTime()
    if (stale) {
      tone = 'warn'
      title = 'Sensors stopped reporting'
      detail = `Last reading ${ago(age)}. Check the ESP32 power and Wi-Fi.`
    } else if (latest.status === 'DANGER') {
      tone = 'danger'
      title = 'Danger'
      detail = parseAlerts(latest.alerts)
        .map((a) => ALERT_TEXT[a] || a)
        .join('. ') + '.'
    } else {
      tone = 'safe'
      title = 'All clear'
      detail = 'Temperature, gas and flame readings are within safe limits.'
    }
  }

  const age = latest ? now - new Date(latest.createdAt).getTime() : null

  return (
    <section className={`band ${tone} ${compact ? 'compact' : ''}`} role="status" aria-live="polite">
      <div>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {online && latest && <p className="age">Last reading {ago(age)}</p>}
    </section>
  )
}
