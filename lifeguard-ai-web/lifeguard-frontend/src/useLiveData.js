import { useCallback, useEffect, useState } from 'react'
import { getAlerts, getConfig, getHistory, getLatest } from './api'

const STALE_AFTER_MS = 15000

// Polls the backend every 2 seconds and tells the page what is happening.
export default function useLiveData({ history = true } = {}) {
  const [latest, setLatest] = useState(null)
  const [readings, setReadings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [config, setConfig] = useState({ tempLimit: 50, gasLimit: 2000 })
  const [online, setOnline] = useState(true)
  const [now, setNow] = useState(Date.now())

  const refresh = useCallback(async () => {
    try {
      if (history) {
        const [l, h, a] = await Promise.all([getLatest(), getHistory(30), getAlerts(8)])
        setLatest(l)
        setReadings(h)
        setAlerts(a)
      } else {
        setLatest(await getLatest())
      }
      setOnline(true)
    } catch {
      setOnline(false)
    }
  }, [history])

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 2000)
    return () => clearInterval(id)
  }, [refresh])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const stale = latest ? now - new Date(latest.createdAt).getTime() > STALE_AFTER_MS : false

  return { latest, readings, alerts, config, online, now, stale, refresh, setOnline }
}
