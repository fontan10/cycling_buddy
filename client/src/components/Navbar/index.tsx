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
        <span className="navbar__bike" aria-hidden="true">🚲</span>
        <span className="navbar__title">Cycling Buddy</span>
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
