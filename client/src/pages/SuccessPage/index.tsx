import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CATEGORIES } from '../../data/categories'
import './SuccessPage.css'

const SPARKLES = ['⭐', '🌟', '✨', '🎉', '💫', '🎊']
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F7B731']

const MESSAGES = [
  "You just karate-chopped a pothole monster right in the face! 🥋",
  "The roads are SHAKING with fear. You did that. 😤",
  "Somewhere, a pothole is crying. Good. 😈",
  "Roses are red, the road had a crack — you reported it fast and now heroes are back! 🌹",
  "Legend says if you report enough potholes, you grow a cape. Keep going. 🦸",
  "The city team just got your report and did a little happy dance. Probably. 💃",
  "You didn't just report a problem — you DEFEATED it. With your FINGER. 👆",
  "Every pothole you report makes a puppy somewhere very happy. Science. 🐶",
  "The road gremlins have been NOTIFIED. They're already fixing it. Maybe. 👺",
  "You're basically a superhero except your power is noticing stuff. That's the best power. 💪",
  "Ding ding ding! We have a WINNER! It's you! You win being awesome! 🔔",
  "A crack in the path, a cry in the night — you grabbed your phone and made it right! 🌙",
  "The pothole didn't stand a chance against your incredible reporting skills. 💥",
  "Fun fact: every report you send makes the roads 0.001% more magical. ✨",
  "You spotted it, you tapped it, you CONQUERED it. Like a road warrior. 🛣️",
  "The City Fix Squad just got a ping. They spilled their coffee. Worth it. ☕",
  "Bumpy roads beware — the Cycling Buddy has a new hero on the streets! 🚴",
  "One small tap for you, one giant leap for everyone's bike wheels. 🌕",
  "Your report is now travelling at the speed of Wi-Fi to people who care. Zoom! 📡",
  "You are literally making the world smoother. That is a real sentence. 🌍",
]

const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]

export function SuccessPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const category = CATEGORIES.find((c) => c.id === state?.categoryId)

  useEffect(() => {
    // Big center burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.45 },
      colors: CONFETTI_COLORS,
    })

    // Side streams for 2 seconds
    const end = Date.now() + 2000
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: CONFETTI_COLORS })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: CONFETTI_COLORS })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div className="success-page">
      <div className="success-page__dots" aria-hidden="true" />

      {/* Floating sparkles */}
      <div className="success-sparkles" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span key={i} className={`success-sparkle success-sparkle--${i + 1}`}>{s}</span>
        ))}
      </div>

      <header className="success-header">
        <button
          className="success-header__back"
          onClick={() => navigate('/', { state: { back: true } })}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="success-header__title">Way to Go!</span>
        {/* <motion.div
          className="success-header__avatar"
          aria-hidden="true"
          animate={{ rotate: [0, -18, 18, -12, 12, 0] }}
          transition={{ delay: 0.6, duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
        >
          🚴
        </motion.div> */}
      </header>

      <motion.div
        className="success-badge-wrap"
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.15 }}
      >
        <div className="success-badge-glow" aria-hidden="true" />
        <motion.div
          className="success-badge"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
        >
          <div className="success-badge__shield">
            <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M40 4 L74 18 L74 48 C74 66 57 80 40 86 C23 80 6 66 6 48 L6 18 Z" fill="#E8A020" />
              <path d="M40 10 L68 22 L68 48 C68 63 53 75 40 80 C27 75 12 63 12 48 L12 22 Z" fill="#F5B830" />
              <text x="40" y="58" textAnchor="middle" fontSize="30">{category?.emoji ?? '🚴'}</text>
            </svg>
          </div>
          <motion.div
            className="success-badge__check"
            aria-hidden="true"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.55 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="success-body">
        <motion.h1
          className="success-body__title"
          initial={{ opacity: 0, scale: 0.6, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.5 }}
        >
          Congratulations!
        </motion.h1>

        <motion.p
          className="success-body__subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          You're a Cycling Hero!
        </motion.p>

        <motion.div
          className="success-body__message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.45 }}
        >
          {randomMessage}
        </motion.div>

        <div className="success-body__stats">
          <motion.div
            className="success-stat success-stat--yellow"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 1.05 }}
          >
            <motion.span
              className="success-stat__value"
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ delay: 1.6, duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
            >
              +50
            </motion.span>
            <span className="success-stat__label">POINTS</span>
          </motion.div>

          <motion.div
            className="success-stat success-stat--green"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 1.2 }}
          >
            <span className="success-stat__value">{category?.label ?? 'Report'}</span>
            <span className="success-stat__label">SUBMITTED</span>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="success-footer"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.45 }}
      >
        <motion.button
          className="success-footer__btn"
          onClick={() => navigate('/', { state: { back: true } })}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Let's go back home
        </motion.button>
      </motion.div>
    </div>
  )
}
