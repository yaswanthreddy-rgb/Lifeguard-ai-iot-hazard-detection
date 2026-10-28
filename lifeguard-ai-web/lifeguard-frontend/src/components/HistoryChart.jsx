import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { clock } from '../utils'

export default function HistoryChart({ history, config }) {
  if (history.length < 2) {
    return (
      <p className="empty">
        The chart appears after two readings. Send a test reading or power on the ESP32.
      </p>
    )
  }

  const data = history.map((r) => ({
    time: clock(r.createdAt),
    temperature: r.temperature,
    gas: r.gas,
  }))

  const tick = { fontSize: 12, fill: '#5C6B80' }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E3E8EE" vertical={false} />
        <XAxis dataKey="time" tick={tick} minTickGap={36} />
        <YAxis yAxisId="t" tick={tick} width={40} domain={['auto', 'auto']} />
        <YAxis yAxisId="g" orientation="right" tick={tick} width={48} domain={[0, 4095]} />
        <Tooltip />
        <Legend />
        <ReferenceLine yAxisId="g" y={config.gasLimit} stroke="#D62828" strokeDasharray="5 4" />
        <Line
          yAxisId="t"
          type="monotone"
          dataKey="temperature"
          name="Temperature (°C)"
          stroke="#0F2747"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="g"
          type="monotone"
          dataKey="gas"
          name="Gas level"
          stroke="#F29F05"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
