// Edit these names before you submit or present the project.
const TEAM = ['Team member 1', 'Team member 2', 'Team member 3']
const GUIDE = 'Dr. Preethi D'
const BATCH = 'MI1235'

const STACK = [
  ['Device', 'ESP32 with DHT22, MQ-2, a flame sensor and an active buzzer'],
  ['Backend', 'Java, Spring Boot, Spring Data JPA'],
  ['Database', 'MySQL (H2 for quick local testing)'],
  ['Website', 'React, Vite, Recharts'],
]

const NEXT = [
  'Send the readings over MQTT instead of plain HTTP.',
  'Notify people by SMS or email when an alert is raised.',
  'Support several ESP32 nodes, one per room, on the same dashboard.',
  'Use the stored history to spot readings that drift before they cross a limit.',
]

export default function About() {
  return (
    <>
      <h1 className="page-title">About the project</h1>
      <p className="lead">
        LifeGuard AI is an intelligent IoT-based multi-hazard detection and emergency response
        platform, built as Minor Project-I at Vel Tech.
      </p>

      <section className="section">
        <h2 className="section-title">Project details</h2>
        <dl className="defs">
          <div><dt>Batch</dt><dd>{BATCH}</dd></div>
          <div><dt>Guide</dt><dd>{GUIDE}</dd></div>
          <div><dt>Team</dt><dd>{TEAM.join(', ')}</dd></div>
        </dl>
      </section>

      <section className="section">
        <h2 className="section-title">Built with</h2>
        <dl className="defs">
          {STACK.map(([name, text]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <h2 className="section-title">What comes next</h2>
        <ul className="plain">
          {NEXT.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
