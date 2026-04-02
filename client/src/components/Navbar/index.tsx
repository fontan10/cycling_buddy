import './Navbar.css'

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__bike" aria-hidden="true">🚲</span>
        <span className="navbar__title">Cycling Buddy</span>
      </div>
      <button className="navbar__profile" aria-label="View profile">
        <svg
          width="18" height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>
    </nav>
  )
}
