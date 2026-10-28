import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>LifeGuard AI is an IoT multi-hazard detection platform built as Minor Project-I at Vel Tech.</p>
        <p>
          <Link to="/dashboard">Dashboard</Link> <Link to="/alerts">Alerts</Link>{' '}
          <Link to="/how-it-works">How it works</Link> <Link to="/about">About</Link>
        </p>
      </div>
    </footer>
  )
}
