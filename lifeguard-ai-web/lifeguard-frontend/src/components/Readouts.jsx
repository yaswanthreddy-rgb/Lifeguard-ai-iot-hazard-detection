export default function Readouts({ latest, config, dim }) {
  const t = latest?.temperature
  const h = latest?.humidity
  const g = latest?.gas
  const f = latest?.flame

  const tempOver = !dim && t != null && t > config.tempLimit
  const gasOver = !dim && g != null && g > config.gasLimit
  const flameOn = !dim && f === true

  const gasPct = g == null ? 0 : Math.min(100, (g / 4095) * 100)
  const limitPct = Math.min(100, (config.gasLimit / 4095) * 100)

  const show = (v, digits = 1) => (v == null ? '\u2014' : Number(v).toFixed(digits))

  return (
    <section className={`readouts ${dim ? 'dim' : ''}`}>
      <div className={`readout ${tempOver ? 'over' : ''}`}>
        <h2>Temperature</h2>
        <p className="num">
          {show(t)}
          <span className="unit"> °C</span>
        </p>
        <p className="note">Alert above {config.tempLimit} °C</p>
      </div>

      <div className="readout">
        <h2>Humidity</h2>
        <p className="num">
          {show(h)}
          <span className="unit"> %</span>
        </p>
        <p className="note">Not used for alerts</p>
      </div>

      <div className={`readout ${gasOver ? 'over' : ''}`}>
        <h2>Gas and smoke</h2>
        <p className="num">{g == null ? '\u2014' : g}</p>
        <div className="gauge" aria-hidden="true">
          <div className="fill" style={{ width: `${gasPct}%` }} />
          <div className="limit" style={{ left: `${limitPct}%` }} />
        </div>
        <p className="note">Alert above {config.gasLimit} (scale 0 to 4095)</p>
      </div>

      <div className={`readout ${flameOn ? 'over' : ''}`}>
        <h2>Flame</h2>
        <p className="num">{f == null ? '\u2014' : f ? 'Detected' : 'None'}</p>
        <p className="note">Infrared flame sensor</p>
      </div>
    </section>
  )
}
