import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AccountIcon, CheckIcon, CyclingBuddyLogo, GroupIcon, PersonIcon, SettingsIcon, SignOutIcon } from '../Icons'
import './Navbar.css'


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
      navigate('/')
    }, 900)
  }

  function handleAccountClick() {
    if (user) {
      navigate('/profile')
    } else {
      navigate('/auth')
    }
    setOpen(false)
  }

  function handleTeamClick() {
    navigate('/team')
    setOpen(false)
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
              alt={user.username || 'Profile'}
            />
          ) : (
            <PersonIcon />
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
                  className="navbar__menu-item"
                  role="menuitem"
                  onClick={handleAccountClick}
                >
                  <span className="navbar__menu-item-icon">
                    {user ? <SettingsIcon /> : <AccountIcon />}
                  </span>
                  Account
                </button>
              </li>
              {user && (
                <li role="none">
                  <button
                    className="navbar__menu-item"
                    role="menuitem"
                    onClick={handleTeamClick}
                  >
                    <span className="navbar__menu-item-icon"><GroupIcon /></span>
                    My Team
                  </button>
                </li>
              )}
              {user && (
                <li role="none">
                  <button
                    className={`navbar__menu-item${signingOut ? ' navbar__menu-item--success' : ''}`}
                    role="menuitem"
                    disabled={signingOut}
                    onClick={handleSignOut}
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
                          <CheckIcon />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="signout"
                          className="navbar__menu-item-icon"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <SignOutIcon />
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
                          Sign Out
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
