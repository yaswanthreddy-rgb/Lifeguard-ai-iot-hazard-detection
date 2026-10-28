import { Link } from 'react-router-dom'
import useLiveData from '../useLiveData'
import StatusBand from '../components/StatusBand'

const HAZARDS = [
  {
    name: 'Fire',
    sensor: 'Infrared flame sensor',
    trigger: 'Any flame in view of the sensor',
    response: 'Buzzer sounds on site and the dashboard turns red.',
  },
  {
    name: 'Gas and smoke',
    sensor: 'MQ-2 gas sensor',
    trigger: 'Gas level above 2000 on a 0 to 4095 scale',
    response: 'Buzzer sounds and the alert is logged with the time.',
  },
  {
    name: 'Heat',
    sensor: 'DHT22 temperature and humidity sensor',
    trigger: 'Temperature above 50 °C',
    response: 'Buzzer sounds and the temperature trend shows the climb.',
  },
]

const STEPS = [
  ['The ESP32 reads its four sensors', 'Every 3 seconds it measures temperature, humidity, gas and flame.'],
  ['It sounds the buzzer on its own', 'The local alarm works even if Wi-Fi is down.'],
  ['It sends the readings over Wi-Fi', 'A small JSON message goes to the Spring Boot server.'],
  ['Spring Boot checks the limits and saves', 'Each reading is marked safe or danger and stored in the database.'],
  ['The dashboard shows it within 2 seconds', 'React reads the latest data and updates the status.'],
]

export default function Home() {
  const { latest, online, stale, now } = useLiveData({ history: false })

  return (
    <>
      <section className="hero">
        <div>
          <h1>Know about fire, gas and heat the moment they start.</h1>
          <p className="lead">
            LifeGuard AI watches four sensors on an ESP32, sounds a buzzer on site, and shows every
            reading on a live dashboard.
          </p>
          <div className="actions">
            <Link className="btn primary" to="/dashboard">
              Open dashboard
            </Link>
            <Link className="btn" to="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
        <StatusBand latest={latest} online={online} stale={stale} now={now} compact />
      </section>

      <section className="section">
        <h2 className="section-title">What it watches for</h2>
        <div className="hazards">
          {HAZARDS.map((h) => (
            <article key={h.name}>
              <h3>{h.name}</h3>
              <p className="sensor">{h.sensor}</p>
              <p>
                <strong>Triggers on:</strong> {h.trigger}
              </p>
              <p>{h.response}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">From sensor to screen</h2>
        <ol className="steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="step-no">{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta">
        <div>
          <h2>Try it without any hardware</h2>
          <p>Open the dashboard and press Send test reading to watch an alert appear.</p>
        </div>
        <Link className="btn primary" to="/dashboard">
          Open dashboard
        </Link>
      </section>
    </>
  )
}
