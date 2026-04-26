import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

// custom: true  = going back  → new page slides in from the left
// custom: false = going forward → new page slides in from the right
const variants = {
  initial: (back: boolean) => ({
    x: back ? '-100%' : '100%',
    opacity: 0.85,
  }),
  enter: {
    x: 0,
    opacity: 1,
    transition: { type: 'tween' as const, duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  exit: (back: boolean) => ({
    x: back ? '100%' : '-100%',
    opacity: 0.85,
    transition: { type: 'tween' as const, duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: 'var(--surface-app)',
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  )
}
