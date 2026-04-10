import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const accountIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const settingsIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const signOutIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CyclingBuddyLogo = () => (
  <svg
    className="navbar__logo"
    width="32"
    height="32"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="cb-logo-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5BC8FF" />
        <stop offset="100%" stopColor="#1A9FEF" />
      </linearGradient>
    </defs>

    {/* Background circle */}
    <circle cx="18" cy="18" r="18" fill="url(#cb-logo-bg)" />

    {/* Rear wheel */}
    <circle cx="10" cy="24" r="5.5" stroke="#FFD600" strokeWidth="2" />
    <circle cx="10" cy="24" r="1.3" fill="#FFD600" />

    {/* Front wheel */}
    <circle cx="26" cy="24" r="5.5" stroke="#FFD600" strokeWidth="2" />
    <circle cx="26" cy="24" r="1.3" fill="#FFD600" />

    {/* Frame — rear triangle */}
    <line x1="10" y1="24" x2="18" y2="24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="24" x2="14" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="10" y1="24" x2="14" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

    {/* Frame — main triangle */}
    <line x1="14" y1="13" x2="23" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="24" x2="23" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

    {/* Fork */}
    <line x1="23" y1="13" x2="26" y2="24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

    {/* Seat */}
    <line x1="14" y1="11" x2="14" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="11" x2="17" y2="11" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" />

    {/* Handlebars */}
    <line x1="23" y1="11" x2="23" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="21" y1="11" x2="25" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />

    {/* Sparkle dots */}
    <circle cx="30" cy="7" r="2.5" fill="#7ED957" />
    <circle cx="32" cy="12" r="1.3" fill="#7ED957" opacity="0.65" />
    <circle cx="6" cy="7" r="1.5" fill="#FFD600" opacity="0.85" />
  </svg>
)

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSignOut() {
    setSigningOut(true)
    setTimeout(() => {
      logout()
      setSigningOut(false)
      setOpen(false)
    }, 900)
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <CyclingBuddyLogo />
        <span className="navbar__title">Cycling<span className="navbar__title-accent">Buddy</span></span>
      </div>

      <div className="navbar__profile-wrap" ref={menuRef}>
        <button
          className="navbar__profile"
          aria-label="View profile"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen(v => !v)}
        >
          {user?.avatarUrl ? (
            <img
              className="navbar__avatar"
              src={user.avatarUrl}
              alt={user.displayName || 'Profile'}
            />
          ) : (
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
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              className="navbar__menu"
              role="menu"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <li role="none">
                <button
                  className={`navbar__menu-item${signingOut ? ' navbar__menu-item--success' : ''}`}
                  role="menuitem"
                  disabled={signingOut}
                  onClick={() => { if (user) handleSignOut(); else { navigate('/auth'); setOpen(false) } }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {signingOut ? (
                      <motion.span
                        key="check"
                        className="navbar__menu-item-icon"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {checkIcon}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="signout"
                        className="navbar__menu-item-icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {user ? signOutIcon : accountIcon}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence mode="wait" initial={false}>
                    {signingOut ? (
                      <motion.span
                        key="label-success"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        Signed out!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="label-default"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {user ? 'Sign Out' : 'Account'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
              <li role="none">
                <button
                  className="navbar__menu-item"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {settingsIcon}
                  Settings
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
