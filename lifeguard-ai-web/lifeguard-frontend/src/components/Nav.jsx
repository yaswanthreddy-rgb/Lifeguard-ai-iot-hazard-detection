import { Link, NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand-link">
          <svg className="logo" viewBox="0 0 32 36" aria-hidden="true">
            <path d="M16 1 3 6v10c0 9 5.5 16 13 19 7.5-3 13-10 13-19V6z" fill="#0F2747" />
            <path d="M16 10c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-9.5z" fill="#F29F05" />
          </svg>
          <span className="brand">LifeGuard AI</span>
        </Link>
        <nav aria-label="Main">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
    </header>
  )
}
