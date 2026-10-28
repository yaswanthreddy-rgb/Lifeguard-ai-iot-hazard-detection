import { Link } from 'react-router-dom'

const PARTS = [
  ['ESP32 dev board', 'The controller. Reads the sensors and talks to Wi-Fi.'],
  ['DHT22', 'Measures temperature and humidity.'],
  ['MQ-2', 'Detects LPG, smoke and other combustible gas.'],
  ['Flame sensor module', 'Sees the infrared light a flame gives off.'],
  ['Active buzzer', 'Gives a loud local alarm.'],
  ['Breadboard, jumper wires, 10 kΩ and 20 kΩ resistors', 'Joins everything; the resistors protect the ESP32 from the MQ-2.'],
]

const PINS = [
  ['DHT22', 'VCC, DATA, GND', '3V3, GPIO 32, GND'],
  ['MQ-2', 'VCC', 'VIN (5 V)'],
  ['', 'AO (analog)', 'GPIO 34, through the voltage divider'],
  ['', 'GND', 'GND'],
  ['Flame sensor', 'VCC, DO, GND', '3V3, GPIO 35, GND'],
  ['Buzzer', '+ (long leg), −', 'GPIO 26, GND'],
]

const SETUP = [
  ['Wire the circuit', 'Follow the pin table above, with the USB cable unplugged.'],
  ['Flash the ESP32', 'Open esp32/lifeguard_esp32 in Arduino IDE, set your Wi-Fi and server address, and upload.'],
  ['Start the backend', 'Run the Spring Boot project. It listens on port 8080.'],
  ['Start the website', 'Run npm install, then npm run dev, and open the dashboard.'],
]

export default function HowItWorks() {
  return (
    <>
      <h1 className="page-title">How it works</h1>
      <p className="lead">
        An ESP32 reads four sensors, sounds a buzzer locally, and sends each reading to a Spring Boot
        server. The server decides whether it is safe, stores it, and this website shows the result.
      </p>

      <section className="section">
        <h2 className="section-title">Parts</h2>
        <dl className="defs">
          {PARTS.map(([name, text]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <h2 className="section-title">Wiring</h2>
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Sensor pin</th>
                <th>Connects to the ESP32</th>
              </tr>
            </thead>
            <tbody>
              {PINS.map(([a, b, c], i) => (
                <tr key={i}>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note-block">
          The MQ-2 runs on 5 V, but ESP32 pins only tolerate 3.3 V. Put a 10 kΩ resistor between AO and
          GPIO 34, and a 20 kΩ resistor from GPIO 34 to GND. This brings the signal down to about 3.3 V.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">When an alert is raised</h2>
        <dl className="defs">
          <div><dt>Fire</dt><dd>The flame sensor reports a flame.</dd></div>
          <div><dt>Gas and smoke</dt><dd>The MQ-2 value is above 2000 (scale 0 to 4095).</dd></div>
          <div><dt>Heat</dt><dd>The temperature is above 50 °C.</dd></div>
        </dl>
        <p className="note-block">
          Change the limits with lifeguard.temp-limit and lifeguard.gas-limit in the backend's
          application.properties. Normal gas readings vary between sensors, so check yours in clean air first.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Setup in four steps</h2>
        <ol className="steps">
          {SETUP.map(([title, text], i) => (
            <li key={title}>
              <span className="step-no">{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="actions">
          <Link className="btn primary" to="/dashboard">
            Open dashboard
          </Link>
        </div>
      </section>
    </>
  )
}
