import { useEffect, useState } from 'react'
import { simulate } from '../api'
import useLiveData from '../useLiveData'
import StatusBand from '../components/StatusBand'
import Readouts from '../components/Readouts'
import HistoryChart from '../components/HistoryChart'
import AlertLog from '../components/AlertLog'

export default function Dashboard() {
  const { latest, readings, alerts, config, online, now, stale, refresh, setOnline } = useLiveData()

  const [auto, setAuto] = useState(false)

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => simulate().catch(() => {}), 3000)
    return () => clearInterval(id)
  }, [auto])

  async function sendTest() {
    try {
      await simulate()
      refresh()
    } catch {
      setOnline(false)
    }
  }

  const showValues = online && latest && !stale

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <StatusBand latest={latest} online={online} stale={stale} now={now} />
      <Readouts latest={latest} config={config} dim={!showValues} />

      <div className="columns">
        <section className="panel">
          <h2>Last 30 readings</h2>
          <HistoryChart history={readings} config={config} />
        </section>
        <section className="panel">
          <h2>Recent alerts</h2>
          <AlertLog alerts={alerts} />
        </section>
      </div>

      <div className="controls">
        <button type="button" onClick={sendTest}>
          Send test reading
        </button>
        <label>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Send a test reading every 3 seconds
        </label>
        <span className="hint">Test readings are fake data for trying the dashboard without the ESP32.</span>
      </div>
    </>
  )
}
