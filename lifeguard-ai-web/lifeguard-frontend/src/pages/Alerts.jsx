import { useEffect, useState } from 'react'
import { getAlerts, getStats } from '../api'
import { ALERT_TEXT, parseAlerts } from '../utils'

const FILTERS = [
  ['', 'All alerts'],
  ['FIRE', 'Fire'],
  ['GAS', 'Gas and smoke'],
  ['HEAT', 'Heat'],
]

const dash = (v, digits) => (v == null ? '\u2014' : digits == null ? v : Number(v).toFixed(digits))

export default function Alerts() {
  const [type, setType] = useState('')
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [a, s] = await Promise.all([getAlerts(100, type), getStats()])
        if (!cancelled) {
          setRows(a)
          setStats(s)
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [type])

  return (
    <>
      <h1 className="page-title">Alerts</h1>

      {error && (
        <p className="notice">Can't reach the server. Start the Spring Boot backend on port 8080.</p>
      )}

      {stats && (
        <section className="stats">
          <div><p className="num">{stats.totalReadings}</p><p className="note">Readings stored</p></div>
          <div><p className="num">{stats.totalAlerts}</p><p className="note">Alerts raised</p></div>
          <div><p className="num">{stats.fireAlerts}</p><p className="note">Fire</p></div>
          <div><p className="num">{stats.gasAlerts}</p><p className="note">Gas and smoke</p></div>
          <div><p className="num">{stats.heatAlerts}</p><p className="note">Heat</p></div>
          <div><p className="num">{dash(stats.avgTemperature, 1)}</p><p className="note">Average °C</p></div>
          <div><p className="num">{dash(stats.maxGas)}</p><p className="note">Highest gas level</p></div>
        </section>
      )}

      <section className="emergency-panel" aria-labelledby="emergency-alerts-title">
        <div className="emergency-panel-head">
          <div>
            <p className="eyebrow">Emergency response</p>
            <h2 id="emergency-alerts-title">Emergency alerts</h2>
          </div>
          <p className="emergency-panel-note">
            When a critical sensor alert is detected, notify the configured response contacts.
          </p>
        </div>
        <div className="emergency-destinations">
          <article className="emergency-destination">
            <span className="emergency-icon" aria-hidden="true">P</span>
            <div>
              <h3>Police station</h3>
              <p>For immediate help with threats, accidents, or unsafe situations.</p>
            </div>
            <span className="emergency-status">Ready</span>
          </article>
          <article className="emergency-destination">
            <span className="emergency-icon" aria-hidden="true">F</span>
            <div>
              <h3>Fire station</h3>
              <p>For flame, smoke, and other fire-related sensor alerts.</p>
            </div>
            <span className="emergency-status">Ready</span>
          </article>
          <article className="emergency-destination">
            <span className="emergency-icon" aria-hidden="true">H</span>
            <div>
              <h3>Hospital</h3>
              <p>For heat, injury, or medical emergencies detected nearby.</p>
            </div>
            <span className="emergency-status">Ready</span>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="table-head">
          <h2>Alert history</h2>
          <div className="table-tools">
            <label>
              Show{' '}
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <a className="btn" href="/api/readings/export">
              Download all readings (CSV)
            </a>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="empty">
            No alerts to show. Alerts appear here when a sensor crosses its limit.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Alert</th>
                  <th>Temperature</th>
                  <th>Gas</th>
                  <th>Flame</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="bad">
                      {parseAlerts(r.alerts)
                        .map((a) => ALERT_TEXT[a] || a)
                        .join(', ')}
                    </td>
                    <td>{dash(r.temperature, 1)} °C</td>
                    <td>{dash(r.gas)}</td>
                    <td>{r.flame ? 'Detected' : 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
