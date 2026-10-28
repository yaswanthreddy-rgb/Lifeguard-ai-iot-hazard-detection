import { ALERT_TEXT, clock, parseAlerts } from '../utils'

export default function AlertLog({ alerts }) {
  if (alerts.length === 0) {
    return (
      <p className="empty">No alerts yet. They appear here when a sensor crosses its limit.</p>
    )
  }

  return (
    <ul className="alerts">
      {alerts.map((a) => (
        <li key={a.id}>
          <span className="when">{clock(a.createdAt)}</span>
          <span className="what">
            {parseAlerts(a.alerts)
              .map((x) => ALERT_TEXT[x] || x)
              .join(', ')}
          </span>
        </li>
      ))}
    </ul>
  )
}
